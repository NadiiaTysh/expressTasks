// Core
import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';

// Tools
import {
    logger,
    errorLogger,
    NotFoundError,
    notFoundLogger,
    validationLogger,
    github2Options,
} from './utils';

// Routers
import * as routers from './routers';

const app = express();

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

passport.use(
    new GitHubStrategy(
        github2Options,
        (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => {
                return done(null, profile);
            });
        },
    ),
);
app.use(bodyParser.json({ limit: '10kb' }));

// Logger
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        let body = Object.keys(req.body).length !== 0 ? JSON.stringify(req.body) : 'No Payload';

        logger.debug(`${req.method} ${body ? `\n${body}` : ''}`);
        next();
    });
}

app.use('/users', routers.users);
app.use('/', routers.auth);
app.use('/classes', routers.classes);
app.use('/lessons', routers.lessons);

app.use('*', (req, res, next) => {
    const error = new NotFoundError(
        `${req.method}: ${req.originalUrl}`,
    );
    next(error);
});

if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line
    app.use((error, req, res, next) => {
        const { name, message, statusCode } = error;
        const errorMessage = `${name}: ${message}`;

        switch (error.name) {
            case 'NotFoundError':
                notFoundLogger.error(message);
                break;

            case 'ValidationError':
                validationLogger.error(message);
                break;

            default:
                errorLogger.error(errorMessage);
                break;
        }

        const status = statusCode || 500;
        res.status(status).json({ message: message });
    });
}

export { app };
