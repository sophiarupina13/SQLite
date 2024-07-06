export class TemplateEngine {
  static compile(template, data) {
    let compiledHtml = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      compiledHtml = compiledHtml.replace(regex, value);
    }
    return compiledHtml;
  }
}

