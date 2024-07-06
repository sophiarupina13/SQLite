const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const { getAmountOfComments, readAllComments, insertNewComment, readLastComment, readComments, getCommentWithId, deleteCommentById, updateCommentTextById } = require('../services/commentsServices.js');
const { checkSessionId } = require('./authControllers.js');

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function addCommentController(req, res) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const { name, comment } = JSON.parse(body);
            if (!name || !comment) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Name and comment are required for each comment.');
                return;
            }
            const inserted = await insertNewComment(name, comment);
            if (!inserted) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Failed to insert the comment.');
                return;
            }
            const updatedComments = await readAllComments()
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(updatedComments));
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
        }
    });
}

async function lastCommentGetController(req, res) {
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

async function getCommentsController(req, res) {
    const parsedUrl = url.parse(req.url);
    const urlParams = querystring.parse(parsedUrl.query);
    if (Object.keys(urlParams).length > 0) {
        const { page = 1, limit = 10 } = urlParams;
        const offset = (page - 1) * limit;
        try {
            const rows = await readComments(limit, offset);
            const totalComments = await getAmountOfComments();
            const totalPages = Math.ceil(totalComments / limit);
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
    // } else if (req.url.split("/").length > 2) {
    //     const id = req.url.split("/")[2];
    //     try {
    //         if (!id || isNaN(id)) {
    //             res.writeHead(400, { 'Content-Type': 'text/plain' });
    //             res.end('Comment ID must be a valid number.');
    //             return;
    //         }
    //         const comment = await getCommentWithId(parseInt(id));
    //         if (!comment) {
    //             res.writeHead(404, { 'Content-Type': 'text/plain' });
    //             res.end('Comment does not exist');
    //             return;
    //         }
    //         res.writeHead(200, { 'Content-Type': 'application/json' });
    //         res.end(JSON.stringify(comment));
    //     } catch (error) {
    //         console.error(error);
    //         res.writeHead(500, { 'Content-Type': 'text/plain' });
    //         res.end('Server Error');
    //     }
    } else {
        try {
            const comments = await readAllComments();
            if (!comments) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('No comments found');
                return;
            }
            const commentsHtml = comments.map(row => `
            <tr>
                <td>${row.id}</td>
                <td>${row.comment}</td>
                <td>${row.time_added}</td>
                <td>${row.name}</td>
                <td>Недоступно</td>
            </tr>
        `).join('');
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(commentsHtml);
        } catch (error) {
            console.error(error);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Server Error');
        }
    }
}

async function deleteCommentController(req, res) {
    const sessionValid = await checkSessionId(req);
    if (!sessionValid) {
        res.status(403).send('Access forbidden. Please login to delete a comment.');
        return;
    }
    const id = req.params.id;
    try {
        if (!id || isNaN(id)) {
            res.status(400).send('Comment ID must be a valid number.');
            return;
        }
        await deleteCommentById(parseInt(id));
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

async function updateCommentController(req, res) {
    const sessionValid = await checkSessionId(req);
    if (!sessionValid) {
        res.status(403).send('Access forbidden. Please login to update a comment.');
        return;
    }
    const id = req.params.id;
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', async () => {
        try {
            const { comment } = JSON.parse(body);
            if (!comment) {
                res.status(400).send('Comment text must be provided.');
                return;
            }
            if (!id || isNaN(id)) {
                res.status(400).send('Comment ID must be a valid number.');
                return;
            }
            await updateCommentTextById(parseInt(id), comment);
            const newComment = await getCommentWithId(parseInt(id));
            if (!newComment) {
                res.status(404).send('Comment does not exist');
                return;
            }
            res.status(200).json(newComment);
        } catch (error) {
            console.error(error);
            res.status(500).send('Server Error');
        }
    });
}

module.exports = { lastCommentGetController, addCommentController, getCommentsController, deleteCommentController, updateCommentController };