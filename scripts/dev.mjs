import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const args=process.argv.slice(2).filter(arg=>arg!=='--strictPort').map(arg=>arg==='--host'?'--hostname':arg);
const portIndex=args.indexOf('--port');
if(portIndex>=0 && !process.env.SITE_URL)process.env.SITE_URL='http://127.0.0.1:'+args[portIndex+1];
const child=spawn(process.execPath,[require.resolve('next/dist/bin/next'),'dev','--webpack',...args],{stdio:'inherit',env:process.env});
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>child.kill(signal));
child.on('exit',code=>process.exit(code??1));
