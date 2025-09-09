import { html } from "common-tags";

const parseVSCode = (
{
  description,
  tabtrigger,
  snippet,
  scope,
}: any,
descAlias: string
) => {
  // escape " with \"
  // split lines by line-break
  const separatedSnippet = snippet
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .split("\n");
  const separatedSnippetLength = separatedSnippet.length;

  const newSnippet = separatedSnippet.map((line, index) => {
    return index === separatedSnippetLength - 1 ? `"${line}"` : `"${line}",`;
  });
  
  return html`
    "${descAlias || description}": {
      "prefix": "${tabtrigger}",
      "body": [
        ${newSnippet.join('\n')}
      ],
      "scope": "${scope || ''}",
      "description": "${description}"
    }
  `;
};

export default parseVSCode;
