import fs from 'fs';
import { parse } from 'querystring';
import { insertNewComment, readLastComment, readComments, getLimitComments, getCommentWithId, deleteCommentById, updateCommentTextById } from '../services/commentsServices.js'
import { checkSessionId } from './authControllers.js'

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export async function addCommentController(req, res) {
    const sessionValid = await checkSessionId(req);
    if (!sessionValid) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access forbidden. Please login to add a comment.');
        return;
    }
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const { comments } = JSON.parse(body);
            if (!comments || !Array.isArray(comments)) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Comments should be provided as an array.');
                return;
            }
            for (const { name, comment } of comments) {
                if (!name || !comment) {
                    res.writeHead(400, { 'Content-Type': 'text/plain' });
                    res.end('Name and comment are required for each comment.');
                    return;
                }
            }
            const insertedCommentIds = await insertNewComment(comments);
            
            const insertedComments = await Promise.all(insertedCommentIds.map(async (id) => {
                const comment = await getCommentWithId(id);
                return {
                    id: comment.id,
                    name: comment.name,
                    comment: comment.comment,
                    time: comment.time_added
                };
            }));
    
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(insertedComments));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
        }
    });
}

export async function lastCommentGetController(req, res) {
    try {
        let data = fs.readFileSync('./public/template/lastcomment.html').toString();

        const row = await readLastComment();

        data = data.replace(/{{comment}}/, escapeHtml(row.comment));
        data = data.replace(/{{name}}/, escapeHtml(row.name));
        data = data.replace(/{{time}}/, row.time_added);

        const contentLength = Buffer.byteLength(data, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html', 'Content-Length': contentLength });
        res.end(data);
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
    }
}

export async function getCommentsController(req, res) {
    if (req.url.split("?")[1]) {
        const urlParams = req.url.split("?")[1]

        const { page = 1, limit = 10 } = parse(urlParams);

        const offset = (page - 1) * limit;

        try {
            const rows = await readComments (limit, offset);
            const totalPages = await getLimitComments (limit);

            const comments = rows.map(row => ({
                id: row.id,
                comment: row.comment,
                name: row.name,
                time: row.time_added
            }));

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ page, limit, totalPages, comments }));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
        }
    }

    else if (req.url.split("/")[2]) {
        const id = req.url.split("/")[2];
        try {
            if (!id || isNaN(id)) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Comment ID must be a valid number.');
                return;
            }
            const comment = await getCommentWithId(parseInt(id));
            if (!comment) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Comment does not exist');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(comment));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
        }
    }
}


export async function deleteCommentController(req, res) {
    const sessionValid = await checkSessionId(req);
    if (!sessionValid) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access forbidden. Please login to add a comment.');
        return;
    }
    const id = req.url.split("/")[2];
    try {
        if (!id || isNaN(id)) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Comment ID must be a valid number.');
            return;
        }
        await deleteCommentById(parseInt(id));
        res.writeHead(204); 
        res.end();
    } catch (error) {
        console.error(error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error');
    }
}

export async function updateCommentController(req, res) {
    const sessionValid = await checkSessionId(req);
    if (!sessionValid) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Access forbidden. Please login to add a comment.');
        return;
    }
    const id = req.url.split("/")[2];
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });

    req.on('end', async () => {
        try {
            const { comment } = JSON.parse(body);
            if (!comment) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Comment text must be provided.');
                return;
            }
            if (!id || isNaN(id)) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Comment ID must be a valid number.');
                return;
            }
            await updateCommentTextById(parseInt(id), comment);
            const newComment = await getCommentWithId(parseInt(id));
            if (!newComment) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Comment does not exist');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newComment));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
        }
    });
}