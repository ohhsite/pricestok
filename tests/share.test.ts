import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shareLink,sharePost} from '../app/lib/share.ts';
import type {Offer} from '../app/lib/data.ts';
test('shared URL is canonical and attributes the company campaign',()=>{
 const url=new URL(shareLink('https://pricestok.pl?token=secret#private','test-oferta',true));
 assert.equal(url.pathname,'/promocja/test-oferta');assert.equal(url.searchParams.get('utm_campaign'),'firmy');assert.equal(url.searchParams.get('token'),null);assert.equal(url.hash,'');
});
test('post includes mandatory conditions and expiration',()=>{
 const o={title:'Rabat 10%',company:'Test',summary:'Oferta',address:'Białystok',end:'2026-12-20',conditions:'Minimum 2 bilety.\\nTylko z kartą.'} as Offer;
 const text=sharePost(o,'https://pricestok.pl/promocja/test',true);
 assert.match(text,/Minimum 2 bilety\.\nTylko z kartą\./);assert.match(text,/2026-12-20/);assert.match(text,/poznaj naszą ofertę/);
});
