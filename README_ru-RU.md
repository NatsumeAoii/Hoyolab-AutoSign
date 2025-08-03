<h1 align="center">
<img width="150" height="150" src="pic/logo.svg" alt=""><br>
Hoyolab-Auto-SignIn
</h1>

<p align="center">
<img src="https://img.shields.io/github/license/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
<img src="https://img.shields.io/github/stars/NatsumeAoii/hoyolab-auto-sign?style=flat-square">
<br><a href="/README_zh-ZH.md">繁体中文<a>     <a href="/README_jp-JP.md">日本語</a>     <a href="/README.md">English</a>     <b>Русский</b>
</p>

Легкий, безопасный и бесплатный скрипт, который автоматически собирает награды за ежедневные отметки в HoYoLAB.
Поддерживает Genshin Impact, Honkai Impact 3rd и Honkai: Star Rail. Поддерживается несколько аккаунтов.

-----

## Особенности (Features)

  * **Поддержка нескольких версий**: Выберите версию, которая лучше всего соответствует вашим потребностям:
    * **Light**: Молниеносно быстрый и эффективный, идеален для большинства пользователей.
    * **Original**: Простой и понятный, идеален для новичков.
    * **Robust**: Содержит расширенные функции, такие как кэширование, повторные запросы и мониторинг производительности для максимальной надежности.
  * **Безопасность**: Вы разворачиваете скрипт самостоятельно в Google Apps Script. Ваши учетные данные остаются у вас.
  * **Бесплатность**: Полностью работает на бесплатном тарифе Google Apps Script.
  * **Удобство**: Автоматически запускается в облаке и отправляет уведомления в Discord или Telegram.

-----

## Какую версию выбрать? (Which Version to Choose?)

| Функция | Light | Original | Robust |
| :--- | :---: | :---: | :---: |
| **Лучше всего для...** | Большинства пользователей, скорости | Новичков, простоты | Опытных пользователей, надежности |
| **Производительность** | 🚀 Высокая (Параллельно) | ✅ Хорошая (Последовательно) | ✨ Высокая (Последовательно) |
| **Ключевые особенности** | Эффективный, современный | Легко читаемый код | Кэширование, Повторы, Мониторинг |
| **Конфигурация** | Один объект `CONFIG` | Отдельные переменные | Расширенный объект `AppConfig` |
| **Среднее время (в сек.)** | 0.5s - 3s | 3s - 5s | 4s - 6s |
| **Длина кода (строк)** | 250~ | 150~ | 900~ |

-----

## Установка (Setup)

1.  Перейдите в [Google Apps Script](https://script.google.com/home/start) и создайте новый проект с произвольным названием.

2.  Выберите редактор и вставьте код [English ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/English/) / [Chinese ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Chinese/) / [Russia ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Russian/) / [Japan ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Japanese/) / [Indonesia ver](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/src/Indonesian/). Следуйте приведенным ниже инструкциям для настройки файла конфигурации и сохраните его.

3.  Выберите «main» и нажмите кнопку «Run» (Запустить) вверху.

4.  Предоставьте необходимые разрешения и убедитесь, что конфигурация верна («Выполнение начато > завершено»).

5.  Нажмите на кнопку `Trigger` (Триггеры) на левой панели/вкладке и добавьте новый триггер, нажав кнопку `Add Trigger` (Добавить триггер) в правом нижнем углу.
    Выберите функцию для запуска: `main`
    Выберите источник события: По времени
    Выберите тип триггера, основанного на времени: Таймер на день
    Выберите время суток: рекомендуется выбрать любое время вне часов пик с 09:00 до 15:00.

-----

## Настройка (Configuration)

```javascript
const profiles = [
  {
    token: "account_mid_v2=1l9XXXXXXXXXX; account_id_v2=28XXXXXXX; ltoken_v2=v2_CANARIAXXXXXXXXXXXXXXX; ltmid_v2=1lXXXXXXX_XX; ltuid_v2=28XXXXXX;",
    genshin: true,
    honkai_star_rail: true,
    honkai_3: true,
    accountName: "YOUR NAME"
  }
];
```

> HoYoLAB изменил правила для токенов в июле 2023 года, переключившись с предыдущих «ltoken» и «ltuid» на «ltoken_v2» и «ltuid_v2».

<details>
<summary><b>Настройки cookie HoYoLAB</b></summary>

**Следуйте этой инструкции, чтобы получить токены** 1. Перейдите на HoYoLAB ([https://www.hoyolab.com/](https://www.hoyolab.com/)) и войдите в систему.
2. Перейдите на страницу своего профиля.
3. Откройте инструменты разработчика (F12 или Ctrl+Shift+I).
4. Перейдите на вкладку "Network" (Сеть).
5. Нажмите кнопку "Preserve Log" / "Persist Logs" (Сохранять журнал).

```
   ![image](https://github.com/NatsumeAoii/Hoyolab-AutoSign/blob/main/pic/E05.png)   
```

6.  Обновите страницу.

7.  Нажмите на запрос `getGameRecordCard`, где метод — "GET" (он должен называться "getGameRecordCard" с вашим HoYoLab UID).

8.  Перейдите на вкладку "Cookies".

9.  Скопируйте "account_mid_v2", "account_id_v2", "ltoken_v2", "ltmid_v2" и "ltuid_v2".

</details>

<details>
<summary><b>Настройки уведомлений Discord</b></summary>

```javascript
const discord_notify = true
const myDiscordID = "20000080000000040"
const discordWebhook = "https://discord.com/api/webhooks/1050000000000000060/6aXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXnB"
```

1.  **discord_notify**

    Включить ли уведомления Discord.
    Если вы хотите включить уведомления об автоматических отметках, установите значение `true`. Если нет, установите `false`.

2.  **myDiscordID** - Пожалуйста, введите ваш ID пользователя Discord.

    Хотите ли вы получать упоминание (ping) при неудачной отметке.
    Скопируйте ваш ID пользователя Discord, который выглядит как `23456789012345678`, и вставьте его в "кавычки".
    Вы можете обратиться к [этой статье](https://support.discord.com/hc/ru/articles/206346498), чтобы найти ваш ID пользователя Discord.
    Если вы не хотите получать упоминания, оставьте "кавычки" пустыми.

3.  **discordWebhook** - Пожалуйста, введите webhook для канала сервера Discord, куда будут отправляться уведомления.

    Вы можете обратиться к [этой статье](https://support.discord.com/hc/ru/articles/228383668), чтобы создать webhook в Discord.
    После завершения создания webhook вы получите его URL, который выглядит примерно так: `https://discord.com/api/webhooks/1234567890987654321/PekopekoPekopekoPekopeko06f810494a4dbf07b726924a5f60659f09edcaa1`.
    Скопируйте URL webhook и вставьте его в "кавычки".

</details>

<details>
<summary><b>Настройки уведомлений Telegram</b></summary>

```javascript
const telegram_notify = true
const myTelegramID = "1XXXXXXX0"
const telegramBotToken = "6XXXXXXXXX:AAAAAAAAAAXXXXXXXXXX8888888888Peko"
```

1.  **telegram_notify**

    Включить ли уведомления Telegram.
    Если вы хотите включить уведомления об автоматических отметках, установите значение `true`. Если нет, установите `false`.

2.  **myTelegramID** - Пожалуйста, введите ваш ID в Telegram.

    Используйте команду `/getid`, чтобы узнать ваш ID пользователя Telegram, отправив сообщение боту [@IDBot](https://t.me/myidbot).
    Скопируйте ваш ID Telegram, который выглядит как `123456780`, и вставьте его в "кавычки".

3.  **telegramBotToken** - Пожалуйста, введите токен вашего Telegram-бота.

    Используйте команду `/newbot`, чтобы создать нового бота в Telegram, отправив сообщение боту [@BotFather](https://t.me/botfather).
    После завершения создания бота вы получите токен вашего Telegram-бота, который выглядит примерно так: `110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw`.
    Скопируйте токен вашего Telegram-бота и вставьте его в "кавычки".
    Для более подробных инструкций вы можете обратиться к [этой статье](https://core.telegram.org/bots/features#botfather).

</details>

-----

## Демо (Demo) (с ошибками)

Если процесс автоматической отметки успешен, будет отправлено "OK".
Если вы уже отметились сегодня, будет отправлено "Путешественник/Первопроходец/Капитан, вы уже отметились сегодня".

<details>
<summary><b>Автоматическая отметка для одного аккаунта HoYoLAB с уведомлением и упоминанием в Discord.</b></summary>
Включить автоматическую отметку для Genshin Impact и Honkai: Star Rail, включить уведомления и упоминания в Discord.

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

</details>

<details>
<summary><b>Автоматическая отметка для двух аккаунтов HoYoLAB с уведомлением в Telegram.</b></summary>
Включить автоматическую отметку для Genshin Impact на аккаунте A, для Honkai Impact 3rd на аккаунте B и включить уведомления в Telegram.

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

</details>

-----

## Журнал изменений (Changelog)

  * **2025-08-01**: Крупный рефакторинг с разделением на версии **Light**, **Original** и **Robust**. Улучшена структура кода, производительность и добавлены расширенные функции, такие как кэширование и повторные запросы (версия Robust).
  * **2024-12-03**: Добавлена поддержка для Tears of Themis и Zenless Zone Zero. Добавлены файлы кода для конкретных языков.
  * **2024-02-02**: Улучшена читаемость и поддерживаемость кода.
  * **2023-05-13**: Добавлена поддержка нескольких аккаунтов HoYoLAB.
  * **2023-05-12**: Добавлена поддержка уведомлений в Telegram.
  * **2023-04-27**: Добавлена поддержка для Honkai Impact 3rd и Honkai: Star Rail.
  * **2022-12-30**: Запуск проекта.

-----