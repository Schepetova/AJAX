var fs = require("fs")
var http = require("http");
var sqlite3 = require("sqlite3").verbose();

var db = new sqlite3.Database("./Cats.db");

var handle_GET = function (request, response) {
    switch (request.url) {
        case "/":
            fs.readFile("./lab6.html", function (err, content) {
                if (!err) {
                    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    response.end(content, "utf-8")
                } else {
                    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
                    response.end(err.message, "utf-8");
                    console.log(err);
                }
            });
            break;
        default:
            response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
            response.end("<!DOCTYPE html>\n" +
                "<html>\n" +
                "   <head>\n" +
                "       <meta charset='utf-8'>\n" +
                "   </head>\n" +
                "   <body>\n" +
                "404, NOT FOUND: " + request.url +
                " \n</body>\n" +
                "</html>"
            );
    }
}

var handle_POST = function (request, response) {
    if (request.url != "/get_table") {
        response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        response.end();
    }

    var data = '';
    request.on('data', function (chunk) {
        data += chunk;
    });
    request.on('end', function () {
        var filters = JSON.parse(data);
        var db_data = {};
        stmt = db.prepare("SELECT * FROM Cats WHERE " +
            "instr(name, ?)>0 AND " +
            "instr(color, ?)>0 AND " + "instr(sex, ?)>0;");
        stmt.all([filters.name, filters.color, filters.sex],
            function (err, rows) {
                if (err) {
                    console.log(err);
                    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
                    response.end();
                } else {
                    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
                    db_data.table = rows;
                    response.end(JSON.stringify(db_data));
                    stmt.finalize();
                }
            });
    });
}

var server_callback = function (request, response) {
    console.log("request to: " + request.url + " method: " + request.method)
    if (request.method == "GET") {
        handle_GET(request, response);
    } else {
        handle_POST(request, response);
    }
}

db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='Cats';", function (err, rows) {
    if (err || rows.length == 0) {
        db.run("CREATE TABLE Cats (name TEXT NOT NULL, color TEXT NOT NULL, sex TEXT NOT NULL);", function (err) {
            //fill here
            var statement = db.prepare("INSERT INTO Cats VALUES(?, ?, ?);")
            statement.run("Барсик", "рыжий", "м");
            statement.run("Рыжик", "рыжий", "м");
            statement.run("Бимка", "черепаший", "ж");
            statement.run("Пушок",  "белый", "м");
            statement.run("Влас","черный", "м");
            statement.run("Мурка", "рыжий", "ж");
            statement.run("Евген", "серый", "м");
            statement.run("Милка", "черепаший", "ж");
            statement.run("Соня", "белый", "ж");
            statement.run("Носик", "рыжий", "м");
            statement.run("Уголек", "черный", "м");
            statement.run("Котик",  "белый", "м");
            statement.run("Дуся",  "черепаший", "ж");
            statement.run("Тося", "рыжий", "ж");
            statement.run("Маруся",  "черный", "м");
            statement.run("Илья",  "рыжий", "м");
            statement.run("Миша", "черно-белый", "м");
            statement.run("Вася",  "черный", "м");
            statement.run("Китя",  "черепаший", "ж");
            statement.run("Шарик", "рыже-белый", "м");
            statement.finalize();
        });
        console.log("db Cats created");
    }
    http.createServer(server_callback).listen(3000);
    console.log("Listen at http://localhost:3000/");
});