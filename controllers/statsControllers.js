// export function statsGetController(req, res) {
//   let html =
//     "<!DOCTYPE html><html><head><title>Статистика</title></head><body><table><thead><tr><th>User-Agent</th><th>Количество запросов</th></tr></thead><tbody>";
//   for (const [ua, count] of Object.entries(stats)) {
//     html += `<tr><td>${ua}</td><td>${count}</td></tr>`;
//   }
//   html += "</tbody></table></body></html>";
//   res.writeHead(200, { "Content-Type": "text/html" });
//   res.end(html);
// }
