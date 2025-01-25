import { Ollama, Message } from 'ollama';
import { parse } from "jsr:@std/yaml";

type TismConfig = { ollama: Config; };
type Config = { endpoint: string, model: string, threads?: number, };
const configText = await Deno.readTextFile("./local.yaml");
const config = parse(configText) as TismConfig;

const ollama = new Ollama({ host: config.ollama.endpoint });
const chatHistory: Message[] = [
  {
    role: 'system',
    content: 'you are a Gen Z adult with brain rot, answer with an attitude and brain rot and some emojis. you are resistant to helping but eventually you will give the correct answer'
  }
];

do {
  const msg = prompt('> ');
  if (!msg) break;

  chatHistory.push({ role: 'user', content: msg });

  const chatResponse = await ollama.chat({
    model: config.ollama.model,
    messages: chatHistory,
    options: {
      num_thread: config.ollama.threads ?? 8,
    },
    stream: true
  });

  let r: string = '';
  for await (const part of chatResponse) {
    Deno.stdout.write(new TextEncoder().encode(`\x1b[31m${part.message.content}\x1b[0m`));
    r += part.message.content;
  }

  console.log();

  chatHistory.push({ role: 'assistant', content: r });

} while (true);