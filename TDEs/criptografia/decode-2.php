<?php
// Recebe a mensagem cifrada em Base64.
// Esse conteúdo veio de fora já pronto, por exemplo gerado pelo OpenSSL.
$blob_b64 = 'U2FsdGVkX1+jncwME0WZJmETN4+Yi+XsnQWPaalIHLc=';

// Recebe o segredo/passphrase que será usado para tentar abrir a mensagem.
// Esse segredo não é a chave AES final; ele ainda vai passar por derivação.
$pass = 'ARTHUR40073497';

// Converte o texto Base64 para bytes crus.
// O segundo parâmetro true faz a função falhar caso o Base64 esteja inválido.
$raw = base64_decode($blob_b64, true);

// Verifica se o blob começa com "Salted__".
// Esse cabeçalho é típico do formato produzido por "openssl enc" com salt.
if (substr($raw, 0, 8) !== "Salted__") die("blob invalido\n");

// Extrai o salt do blob.
// Nesse formato, os bytes 8..15 guardam o salt.
$salt = substr($raw, 8, 8);

// Extrai o ciphertext de verdade.
// A partir do byte 16 começa o conteúdo efetivamente cifrado.
$ciphertext = substr($raw, 16);

// Deriva material criptográfico a partir do segredo + salt.
// Aqui pedimos 48 bytes no total:
// - 32 bytes para a chave AES-256
// - 16 bytes para o IV do CBC
// Usa PBKDF2 com SHA-256 e 200000 iterações.
$dk = openssl_pbkdf2($pass, $salt, 48, 200000, 'sha256'); // 32 key + 16 iv

// Separa os primeiros 32 bytes da derivação como chave AES.
$key = substr($dk, 0, 32);

// Separa os 16 bytes seguintes como IV.
$iv  = substr($dk, 32, 16);

// Tenta descriptografar o ciphertext usando:
// - AES-256-CBC
// - a chave derivada
// - o IV derivado
// OPENSSL_RAW_DATA diz que o ciphertext está em bytes crus, não em Base64.
$plain = openssl_decrypt($ciphertext, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);

// Se falhar, imprime ERRO.
// Se funcionar, imprime o texto original recuperado.
echo $plain === false ? "ERRO\n" : $plain . "\n";
