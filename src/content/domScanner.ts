export interface TextChunk {
    node: Text,
    text: string
}

export function collectTextChunks(root: Node = document.body): TextChunk[] {
    const chunks: TextChunk[] = [];

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    let currentNode = walker.nextNode();

    while (currentNode != null) {
        if (currentNode.nodeType != Node.TEXT_NODE) {
            currentNode = walker.nextNode();
            continue;
        }
        const textNode = currentNode as Text;
        const text = textNode.textContent ?? "";

        if (text.trim().length > 0) {
            chunks.push({
                node: textNode,
                text
            })
        }

        currentNode = walker.nextNode();
    }

    return chunks;
}