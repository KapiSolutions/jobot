<h1 align="center">
  🤖 Jobot
</h1>

This project is a bot for scrapping tech job boards.

---

### 🎯 Project base requirements

- Bot should scrap 2 selected job boards
- Bot should serve endpoint for getting job offers based on specific search value
- User should be able to generate list of job offers based on specific search value using CLI
- User should be able to parametrize the amount of records found

### 🛠 Tech Stack

**Back End:** Node.js with TypeScript, Puppeteer
**Production:** Docker, Render

### 🔗 Live link
https://jobot.onrender.com

## Run Locally

### Clone Repository

```bash
git clone https://github.com/KapiSolutions/jobot.git
cd jobot
```

### Installing Dependencies

Make sure you have Node.js installed.

```bash
npm install
```

### A) Scrapp offers using CLI

```bash
npm run scrap:offers -- -s search_value -l limit
```
Replace `search_value` and `limit` with your values.

### B) Scrapp offers using API request
Start the server and expose the API for getting offers:

```bash
npm run server
```
Server should be exposed on port 4200.

### API Reference

### Get Offers by Search Value

Get a list of offers based on a search value.

- **Method:** GET
- **Endpoint:** `/offers/:search_value`
- **Query Parameters:**
  - `limit` (optional): The maximum number of offers to retrieve per service (default: 10).

#### Example

```http
GET /offers/javascript?limit=5
```

## License

[GNU](https://choosealicense.com/licenses/gpl-3.0/)