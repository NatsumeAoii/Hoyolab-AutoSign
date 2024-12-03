<h1 align="center">
    <img width="150" height="150" src="pic/logo.svg" alt=""><br>
    Hoyolab-Auto-SignIn
</h1>

<p align="center">
    <img src="https://img.shields.io/github/license/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
    <img src="https://img.shields.io/github/stars/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
    <br><a href="/README_zh-ZH.md">繁体中文<a>    <a href="/README_jp-JP.md">日本語</a>    <a href="/README.md">English</a>    <b>Русский</b>
</p>

Легкий, безопасный и бесплатный скрипт, который автоматически собирает ежедневные награды HoYoLAB.  
Поддерживает Genshin Impact, Honkai Impact 3rd и Honkai: Star Rail. Поддерживает несколько аккаунтов.

## Особенности
* **Легкость** - Скрипт требует минимальной конфигурации и занимает всего около 110 строк кода.
* **Безопасность** - Скрипт можно развернуть самостоятельно в Google Apps Script, что исключает утечку данных.
* **Бесплатно** - Google Apps Script в настоящее время бесплатен.
* **Простота** - Скрипт работает без браузера и автоматически уведомляет вас через Discord или Telegram.

## Настройка
1. Перейдите на [Google Apps Script](https://script.google.com/home/start) и создайте новый проект с произвольным именем.
2. Выберите редактор и вставьте код [English ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-discord-telegram-enEN.gs) / [Chinese ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-discord-telegram-zhZH.gs) / [Russia ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-discord-telegram-ruRU.gs) / [Japan ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-discord-telegram-jpJP.gs) / [Indonesia ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/main-discord-telegram-idID.gs). Ознакомьтесь с инструкцией ниже для настройки файла конфигурации и сохраните его.
3. Выберите функцию "main" и нажмите кнопку "Выполнить" сверху.  
   
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E04.png)
4. Предоставьте необходимые разрешения и убедитесь, что конфигурация корректна (Execution started > completed).
5. Нажмите кнопку `Триггеры` слева и добавьте новый триггер, нажав кнопку `Добавить триггер` в правом нижнем углу.  
   Выберите функцию для выполнения: main  
   Выберите источник события: Запуск по времени  
   Выберите тип запуска: Таймер  
   Время дня: рекомендуется выбрать любое непиковое время с 09:00 до 15:00 или с 09:00 до 15:00.

## Конфигурация

```javascript
const profiles = [
  {
    token: "account_mid_v2=1l9XXXXXXXXXX; account_id_v2=28XXXXXXX; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXX; ltmid_v2=1lXXXXXXX_XX; ltuid_v2=28XXXXXX;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    accountName: "ВАШЕ ИМЯ"
  }
];
```

> HoYoLAB изменил правила токенов в июле 2023 года, перейдя от использования "ltoken" и "ltuid" к "ltoken_v2" и "ltuid_v2".  

> [!ВАЖНО]
> HoYoLAB изменил cookie на HttpOnly. Теперь невозможно читать cookie с использованием кода getToken.js.  
> Для получения account_mid_v2, account_id_v2, ltoken_v2, ltmid_v2 и ltuid_v2 используйте метод ручного копирования cookie.

<details>
<summary><b>Настройка cookies HoYoLAB</b></summary>

   **Следуйте этой инструкции для получения токенов**      
   1. Перейдите на HoYoLAB (https://www.hoyolab.com/) и войдите в аккаунт.
   2. Откройте вашу страницу профиля.
   3. Откройте инструменты разработчика (F12 или Ctrl+Shift+I).
   4. Перейдите на вкладку "Сеть" (Network).
   5. Нажмите на "Сохранить лог" (Preserve Log).
      
      ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E05.png)  
   6. Обновите страницу.
   7. Найдите запрос getGameRecordCard с методом "GET".
      
      ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E06.png)  
   8. Перейдите на вкладку "Cookies".
   9. Скопируйте "account_mid_v2", "account_id_v2", "ltoken_v2", "ltmid_v2", и "ltuid_v2".
      ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E07.png)  

</details>

<details>
<summary><b>Настройка уведомлений Discord</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1. **discord_notify**  
   Включение уведомлений через Discord. Установите в true для включения.

2. **myDiscordID**  
   Ваш ID пользователя Discord для пинга при ошибках.

3. **discordWebhook**  
   URL вебхука Discord.

</details>

<details>
<summary><b>Настройка уведомлений Telegram</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1. **telegram_notify**  
   Включение уведомлений через Telegram.

2. **myTelegramID**  
   Ваш Telegram ID.

3. **telegramBotToken**  
   Токен вашего бота Telegram.

</details>

## Демо
Если процесс авто-проверки успешен, будет отправлено сообщение "OK".  
Если вы уже прошли проверку в этот день, будет отправлено сообщение "Traveler/Trailblazer/Captain, you've already checked in today".

<details>
<summary><b>Автоматическая проверка одного аккаунта HoYoLAB с уведомлением Discord и пингом.</b></summary>
Включена авто-проверка для Genshin Impact и Honkai: Star Rail, уведомления Discord и пинг в Discord.

```javascript
/** Пример **/
const profiles = [
  { token: "account_mid_v2=123xyzabcd_hi; account_id_v2=26XXXXX20; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3406; ltmid_v2=123xyzabcd_hi; ltuid_v2=26XXXXX20;", 
    genshin: true, 
    honkai_star_rail: true, 
    honkai_3: false, 
    accountName: "HuTao" }
];

const discord_notify = true
const myDiscordID = "240000800000300040"
const discordWebhook = "https://discord.com/api/webhooks/10xxxxxxxxxxxxxxx60/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```
![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E02.png)

</details>

<details>
<summary><b>Автоматическая проверка двух аккаунтов HoYoLAB с уведомлениями Telegram.</b></summary>
Включена авто-проверка для Genshin Impact на аккаунте A и Honkai Impact 3rd на аккаунте B, уведомления Telegram.

```javascript
/** Пример **/
const profiles = [
  { token: "account_mid_v2=123xyzabcd_hi; account_id_v2=26XXXXX20; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX3406; ltmid_v2=123xyzabcd_hi; ltuid_v2=26XXXXX20;", 
    genshin: true, 
    honkai_star_rail: false, 
    honkai_3: false, 
    accountName: "accountA" },

  { token: "account_mid_v2=456qwertyu_hi; account_id_v2=28XXXXX42; ltoken_v2=v2_GENSHINXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX5566; ltmid_v2=456qwertyu_hi; ltuid_v2=28XXXXX42;", 
    genshin: false, 
    honkai_star_rail: false, 
    honkai_3: true, 
    accountName: "accountB" }
];

const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```
![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E03.png)

</details>

## Изменения
- 2022-12-30: Запуск проекта.
- 2023-04-27: Добавлена поддержка Honkai Impact 3rd и Honkai: Star Rail.
- 2023-04-27: Добавлена функция уведомлений Discord.
- 2023-05-12: Обновлен процесс получения токена.
- 2023-05-12: Добавлена поддержка уведомлений Telegram.
- 2023-05-13: Добавлена поддержка нескольких аккаунтов.
- 2024-02-02: Улучшена читаемость и экспериментальная версия с поддержкой Telegram и Discord.
- 2024-12-03: Добавлена поддержка Tears of Themis и Zenless Zone Zero.  
