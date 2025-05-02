import fs from 'fs';
import path from 'path';

const STORAGE_DIR = path.join(process.cwd(), 'sequence-tracking');

if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR);
}

export function getSequenceFilePath(topicId: string) {
    return path.join(STORAGE_DIR, `topic-${topicId}.seq`);
}

export function loadLastSequenceNumber(topicId: string): number {
    const file = getSequenceFilePath(topicId);
    if (!fs.existsSync(file)) return 0;

    try {
        return parseInt(fs.readFileSync(file, 'utf-8'), 10) || 0;
    } catch {
        return 0;
    }
}

export function saveLastSequenceNumber(topicId: string, sequence: number): void {
    const file = getSequenceFilePath(topicId);
    fs.writeFileSync(file, sequence.toString(), 'utf-8');
}
