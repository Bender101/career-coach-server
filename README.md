Репозиторий клиентской части: https://github.com/Bender101/career-coach-client

Back-end for "Career coach" project

Серверная часть проекта "Карьерный коуч" - анализ известных платформ по поиску работы с целью определения наиболее часто требуемых работодателями навыков и выдаче рекомендаций по профессиональному развитию и оформлению резюме.

Реализовано 2 типа сбора информации - работа с API и веб-скраппинг.

# Для запуска сервера:
* Создайте базу данных в PostgreSQL
* В главной директории создайте файл .env и заполните поля в соответствии с фалом .env_example
* В главной директории ввыполните команды: 
 ```
 npm i 
 
 npx sequelize db:migrate 
 
 npx sequelize db:seed:all 
 
 npm start
```
