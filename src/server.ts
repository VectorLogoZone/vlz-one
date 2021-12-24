import Koa = require('koa');
import KoaRouter from 'koa-router';
import KoaStatic from 'koa-static';
import * as os from 'os';
import Pino from 'pino';
import PinoCaller from 'pino-caller';
import * as PinoHttp from 'pino-http';

const app = new Koa();
app.proxy = true;

const logger = PinoCaller(Pino({
    name: 'vlz-one',
    level: process.env.LOG_LEVEL || 'info',
    redact: [],
    serializers: Pino.stdSerializers,
}));

function CustomPinoLogger(opts: PinoHttp.Options): any {
    var wrap: any = PinoHttp.pinoHttp(opts)
    function pino(ctx: any, next: any) {
        wrap(ctx.req, ctx.res)
        ctx.log = ctx.request.log = ctx.response.log = ctx.req.log
        return next().catch(function (e: any) {
            ctx.log.error({
                res: ctx.res,
                err: {
                    type: e.constructor.name,
                    message: e.message,
                    stack: e.stack
                },
                responseTime: ctx.res.responseTime
            }, 'request errored')
            throw e
        })
    }
    pino.logger = wrap.logger
    return pino
}

app.use(CustomPinoLogger({
    autoLogging: {
        ignorePaths: ['/status.json']
    },
    logger
}));

app.use(async(ctx, next) => {
    try {
        await next();
        const status = ctx.status || 404;
        if (status === 404) {
            ctx.log.warn( { url: ctx.request.url }, 'File not found');
            ctx.status = 404;
            ctx.body = { success: false, code: 404, message: 'File not found', url: ctx.request.url };
        }
    } catch (err) {
        ctx.log.error( { err, url: ctx.request.url }, 'Server Error');
        ctx.body = { success: false, code: 500, message: err.message };
    }
});


app.use(KoaStatic("static", { maxage: 24 * 60 * 60 * 1000 }));

const rootRouter = new KoaRouter();

rootRouter.get('/', async (ctx) => {
    await ctx.redirect('https://www.vectorlogo.zone/');
});

rootRouter.get('/index.html', async (ctx) => {
    await ctx.redirect('https://www.vectorlogo.zone/');
});

function getFirst(value: string | string[] | undefined): string | undefined {
    if (!value) {
      return undefined;
    }

    if (Array.isArray(value)) {
      return value[0];
    }

    return value;
}

rootRouter.get('/status.json', (ctx) => {
    const retVal: {[key:string]: any } = {};

    retVal["success"] = true;
    retVal["message"] = "OK";
    retVal["timestamp"] = new Date().toISOString();
    retVal["lastmod"] = process.env['LASTMOD'] || null;
    retVal["commit"] = process.env['COMMIT'] || null;
    retVal["tech"] = "NodeJS " + process.version;
    retVal["__dirname"] = __dirname;
    retVal["__filename"] = __filename;
    retVal["os.hostname"] = os.hostname();
    retVal["os.type"] = os.type();
    retVal["os.platform"] = os.platform();
    retVal["os.arch"] = os.arch();
    retVal["os.release"] = os.release();
    retVal["os.uptime"] = os.uptime();
    retVal["os.loadavg"] = os.loadavg();
    retVal["os.totalmem"] = os.totalmem();
    retVal["os.freemem"] = os.freemem();
    retVal["os.cpus.length"] = os.cpus().length;
    // too much junk: retVal["os.networkInterfaces"] = os.networkInterfaces();

    retVal["process.arch"] = process.arch;
    retVal["process.cwd"] = process.cwd();
    retVal["process.execPath"] = process.execPath;
    retVal["process.memoryUsage"] = process.memoryUsage();
    retVal["process.platform"] = process.platform;
    retVal["process.release"] = process.release;
    retVal["process.title"] = process.title;
    retVal["process.uptime"] = process.uptime();
    retVal["process.version"] = process.version;
    retVal["process.versions"] = process.versions;

    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET');
    ctx.set('Access-Control-Max-Age', '604800');

    const callback = getFirst(ctx.request.query['callback']);
    if (callback && callback.match(/^[$A-Za-z_][0-9A-Za-z_$]*$/) != null) {
        ctx.type = 'text/javascript';
        ctx.body = callback + '(' + JSON.stringify(retVal) + ');';
    } else {
        ctx.type = 'application/json';
        ctx.body = JSON.stringify(retVal);
    }
});

app.use(rootRouter.routes());

const handleRegex = new RegExp('^[a-z0-9][-_a-z0-9]*[a-z0-9]$');

app.use(async (ctx, next) => {
    /*
    ctx.body = {
        handle: handle,
        url: ctx.url,
        href: ctx.href,
        originalUrl: ctx.originalUrl,
        path: ctx.path,
        origin: ctx.origin
    };
    return;
    */
    const handle = ctx.path.slice(1);
    if (handleRegex.test(handle)) {
        ctx.redirect(`https://www.vectorlogo.zone/logos/${handle}/index.html`);
        //ctx.body = `would redirect to ${handle}`;
        return;
    }
    next();
});

async function main() {

    const listener = app.listen(process.env.PORT || "4000", function () {
        logger.info( { address: listener.address() }, 'Running');
    });
}

main();
