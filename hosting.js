const express = require('express'),
    fs = require('fs'),
    path = require('path'),
    CONFIG = require('./hosting/config'),
    QUERY = require('./hosting/queryes'),
    pg = require('pg');

const pool = pg.Pool({connectionString: CONFIG.DATABASE_URL});
pool.query(QUERY.GET_SITES)
    .then(({rows}) => {
        pool.end();
        rows.map((site) => {
            const app = express();

            app.set('port', (process.env.PORT || site.port));
            app.use(express.static(`sites/${site.name}`));

            app.get('/*', (req, res) => {
                const stream = fs.createReadStream(path.resolve(`sites/${site.name}/index.html`));
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/html');
                stream.pipe(res);
            });

            app.listen(app.get('port'), () => {console.log('Site server started on port ' + app.get('port'))});
        });
    });