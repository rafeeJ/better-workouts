import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import 'dotenv/config';

const app = new Koa();
const router = new Router();

// Middleware
app.use(bodyParser());

// Routes
router.get('/', async (ctx) => {
    ctx.body = 'Hello, Ellie!!';
});

// Apply routes
app.use(router.routes()).use(router.allowedMethods());

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
