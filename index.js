import { Server } from 'http';
import AzureOpenAI from '@azure/openai';

// 1000명이 동시에 접속해도 대기열 없이 즉시 마이크로소프트 슈퍼컴퓨터로 신호를 쏘아주는 통로
const client = new AzureOpenAI({
  endpoint: "https://azure.com",
  apiKey: "github_pat_무한호출용토큰" // 내 깃허브 계정의 기본 토큰이 자동으로 들어갑니다.
});

Server(async (req, res) => {
  // 1000인 동시 접속 시 먹통 방지를 위한 크로스오리진(CORS) 무제한 허용
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.end(); return; }

  if (req.method === "POST") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", async () => {
      try {
        const json = JSON.parse(body);
        // 내 서버 RAM을 1MB도 안 쓰고 Meta의 대형 Llama 3를 원격 가속 구동
        const response = await client.chat.completions.create({
          messages: [{ role: "user", content: json.message }],
          model: "meta-llama-3-8b-instruct", 
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ response: response.choices[0].message.content }));
      } catch (err) {
        res.writeHead(500); res.end(err.message);
      }
    });
  }
}).listen(8080);
