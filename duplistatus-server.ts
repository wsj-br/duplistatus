import { createServer } from 'http';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; //always listen on 0.0.0.0
const port = parseInt(process.env.PORT || '9666', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Use the original req.url for Next.js handler, as handle expects (req, res, parsedUrl?)
      await handle(req, res);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
  .listen(port, hostname, () => {
    console.log('\n\n🌐 \x1b[34mduplistatus-server\x1b[0m');
    console.log(`✅ Ready on http://${hostname}:${port} \n\n`);
  });
});

