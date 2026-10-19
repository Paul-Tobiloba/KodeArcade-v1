import PDFDocument from 'pdfkit';
import { readFileSync } from 'node:fs';
import SVGtoPDF from 'svg-to-pdfkit';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { pictures } from '../shared/pictures.js';
const brandMark = readFileSync(new URL('../public/brand/mark-email.png', import.meta.url));

export type Card = { name: string; username: string; className: string; classCode: string; grade: number; method: 'picture' | 'text'; credential: string | readonly string[]; origin: string; context?: 'home' };

// Returned directly to an authorized manager. Never persisted, cached or publicly hosted.
export function loginCard(card: Card): Promise<Buffer> {
  return loginCards([card]);
}
export function loginCards(cards: readonly Card[]): Promise<Buffer> {
  if (!cards.length || cards.length > 50) return Promise.reject(new Error('Use 1 to 50 cards'));
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40, info: { Title: 'Private KodeArcade student login card', Author: 'KodeArcade' } });
    const chunks: Buffer[] = [];
    doc.on('data', chunk => chunks.push(chunk)); doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject);
    cards.forEach((card, page) => {
    if (page) doc.addPage();
    doc.roundedRect(40, 40, 515, 490, 18).fill('#f5f1ff');
    doc.roundedRect(40, 40, 515, 70, 18).fill('#241856');
    doc.image(brandMark, 64, 57, { width: 34, height: 33 });
    doc.font('Helvetica-Bold').fontSize(26).fillColor('white').text('KodeArcade', 108, 63);
    doc.fontSize(10).text('PRIVATE LOGIN CARD', 360, 72, { width: 170, align: 'right' });
    doc.fontSize(25).fillColor('#181053').text(card.name, 64, 135, { width: 465, height: 66, ellipsis: true });
    doc.font('Helvetica').fontSize(12).text(`${card.className}  |  Grade ${card.grade}`, 64, 202, { width: 465, height: 34, ellipsis: true });
    const row = (label: string, value: string, y: number) => {
      doc.font('Helvetica').fontSize(11).fillColor('#575472').text(label, 64, y);
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#181053').text(value, 64, y + 18, { width: 465, height: 40, ellipsis: true });
    };
    row('Website', `${card.origin}/#/${card.context === 'home' ? 'home-login' : 'student-login'}`, 250);
    row(card.context === 'home' ? 'Home code' : 'Classroom code', card.classCode, 316);
    row('Username', card.username, 378);
    doc.font('Helvetica').fontSize(11).fillColor('#575472').text(card.method === 'picture' ? 'Tap these four pictures in order (repeats are allowed)' : 'Text password (three words, with spaces)', 64, 441);
    if (typeof card.credential === 'string') {
      doc.font('Helvetica-Bold').fontSize(22).fillColor('#181053').text(card.credential, 64, 467, { width: 465, height: 52 });
    } else {
      card.credential.forEach((id, index) => {
        const picture = pictures.find(picture => picture.id === id)!;
        const x = 64 + index * 114;
        doc.roundedRect(x, 461, 102, 57, 8).fill('#ffffff');
        const svg = renderToStaticMarkup(createElement(picture.icon, { size: 28, color: '#6237df', strokeWidth: 2 }));
        SVGtoPDF(doc, svg, x + 37, 466, { width: 28, height: 28 });
        doc.font('Helvetica').fontSize(10).fillColor('#181053').text(`${index + 1}. ${picture.name}`, x, 500, { width: 102, align: 'center' });
      });
    }
    doc.font('Helvetica-Bold').fontSize(18).fillColor('#181053').text('How to sign in', 64, 565);
    doc.font('Helvetica').fontSize(13).text(`1. Open the website above.\n2. Enter your ${card.context === 'home' ? 'home' : 'classroom'} code and username.\n3. Choose your password method, then enter your password.\n4. Open a course and start learning.`, 64, 600, { width: 465, lineGap: 9 });
    doc.fontSize(11).fillColor('#575472').text(`Keep this card private. Do not share your password.\nOn a shared computer, always sign out when you finish.\nLost your card? Ask your ${card.context === 'home' ? 'parent' : 'teacher'} to reset it and print a new one.`, 64, 730, { width: 465, lineGap: 5 });
    });
    doc.end();
  });
}
