import { VanillaApp } from './server.js'
import { rootGetController, rootGetStyleController } from './controllers/rootControllers.js';
import { lastCommentGetController, addCommentController, getCommentsController, deleteCommentController, updateCommentController } from './controllers/commentControllers.js';
import { signUpGetController, signUpPostController, signUpStyleGetController, logInGetController, logInPostController, logInStyleGetController, logOutPostController } from "./controllers/authControllers.js"

const PORT = 3001;
const HOST = "127.0.0.1";
const HTML_FILES = {
'/lastcomment.html': './public/template/lastcomment.html'};

const myServer = new VanillaApp();

myServer.static(HTML_FILES);

myServer.add('GET', '/style.css', rootGetStyleController);
myServer.add('GET', '/index', rootGetController);
myServer.add('POST', '/comments', addCommentController);
myServer.add('GET', '/comments', getCommentsController);
myServer.add('GET', '/lastcomment', lastCommentGetController); 
myServer.add('DELETE', '/comments', deleteCommentController);
myServer.add('PATCH', '/comments', updateCommentController);
myServer.add('GET', '/style.css', signUpStyleGetController);
myServer.add('GET', '/signup', signUpGetController);
myServer.add('POST', '/signup', signUpPostController);
myServer.add('GET', '/login', logInGetController);
myServer.add('GET', '/style.css', logInStyleGetController);
myServer.add('POST', '/login', logInPostController);
myServer.add('POST', '/logout', logOutPostController);

myServer.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

