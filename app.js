const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const morgan = require('morgan')
const methodOverride = require('method-override')
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
const MongoDbStore = require('connect-mongo');
const connectDB = require('./config/db')
//Load config
dotenv.config({ path: './config/config.env' })

// Passport config
require('./config/passport')(passport)

connectDB()

const app = express()

// BODY PARSER
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Method OVERRIDE
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {

        let method = req.body._method
        delete req.body._method
        return method

    }
}))

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
// HANDLEBARS HELPERS
const { formatDate, stripTags, truncate , editIcon, select} = require('./helpers/hbs')

// Handlebars
app.engine('.hbs', exphbs({ helpers: {
                            formatDate,
                            stripTags,
                            truncate,
                            editIcon,
                            select,
                                        },
                            defaultLayout: 'main',
                            extname: '.hbs'}));
app.set('view engine', '.hbs');

// SESSIONS
app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: false,
        store: MongoDbStore.create({
            mongoUrl: 'mongodb+srv://brad1234:brad1234@cluster1.vvhvs.mongodb.net/megoa?retryWrites=true&w=majority'
        })
    })
);

//PASSPORT MIDDLEWARE
app.use(passport.initialize())
app.use(passport.session())

// SET GLOBAL VARIABLE
app.use(function (req, res, next) {
    res.locals.user = req.user || null
    next()
})

// Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))
app.use('/stories', require('./routes/stories'))

const PORT = process.env.PORT || 3000


app.listen(PORT,
     console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`))