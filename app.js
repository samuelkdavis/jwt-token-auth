const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();
const config = require('./config');
const tokenList = {};
const app = express();

router.get('/', (req, res) => {
    res.send('ok');
});

router.post('/login', (req, res) => {
    const postData = req.body;
    const user = {
        email: postData.email,
        name: postData.name
    };

    const token = jwt.sign(user, config.secret, { expiresIn: config.tokenLife });
    const refreshToken = jwt.sign(user, config.refreshTokenSecret, { expiresIn: config.refreshTokenLife });

    const response = {
        status: "Logged in",
        token: token,
        refreshToken: refreshToken,
    };

    tokenList[refreshToken] = response;
    res.status(200).json(response);
});

router.post('/token', (req, res) => {
    const postData = req.body;

    if((postData.refreshToken) && (postData.refreshToken in tokenList)){
        const user = {
            email: postData.email,
            name: postData.name,
        };

        const token = jwt.sign(user, config.secret, {expiresIn: config.tokenLife});
        const response = {
            token: token,
        };

        tokenList[postData.refreshToken].token = token;
        res.status(200).json(response);
    } else {
        res.status(400).send('Invalid request');
    }
});

router.use(require('./tokenChecker'));

router.get('/secure', (req, res) => {
    res.send('I am secured');
});

app.use(bodyParser.json());
app.use('/api', router);
app.listen(config.port || process.env.port || 3000);