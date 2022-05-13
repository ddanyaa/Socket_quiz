var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

let correctAnswers = 0;
let incorrectAnswers = 0;
let usersCorrect = [];
let usersIncorrect = [];
let totalAnswers = 0;


// Страница для ввода вопроса
app.get('/ask', function (req, res) {
    res.sendFile(__dirname + '/ask.html');
});

// Страница для ответа
app.get('/answer', function (req, res) {
    res.sendFile(__dirname + '/answer.html');
});


var correctanswer = "";

io.on('connection', function (socket) {

    // После подтверждения вопроса
    socket.on('submitQuestion', function (quesdata) {
        console.log("question submitted: " + JSON.stringify(quesdata) + " " + quesdata.question + " " + quesdata.questionType);
        correctanswer = quesdata.answer;
        socket.broadcast.emit('deliverQuestion', {
            question: quesdata.question, questionType: quesdata.questionType, timeLimit: quesdata.timeLimit
        });
    });

    // Ответ на вопрос отправлен
    socket.on('answerQuestion', function (answerdata) {
        // Отправка результата на клиент
        if (answerdata.answer == correctanswer) {
            correctAnswers++;
            usersCorrect.push(answerdata.username);
        } else {
            incorrectAnswers++;
            usersIncorrect.push(answerdata.username);
        }

        totalAnswers = correctAnswers + incorrectAnswers;
        correctAnswers = correctAnswers;
        incorrectAnswers = incorrectAnswers;
        incorrectUsers = usersIncorrect;
        correctUsers = usersCorrect;

        socket.broadcast.emit("deliverData", {
            totalAnswers: totalAnswers,
            correctAnswers: correctAnswers,
            incorrectAnswers: incorrectAnswers,
            incorrectUsers: incorrectUsers,
            correctUsers: correctUsers
        });


        io.to(socket.id).emit("resultQuestion", {
            correct: (correctanswer == answerdata.answer), answer: correctanswer, username: answerdata.username
        });
    });


});

// Слушаем 3000 порт на локалке
http.listen(3000, function () {
    console.log('listening: 127.0.0.1:3000');
});
