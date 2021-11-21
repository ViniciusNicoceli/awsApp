"use strict";
const usuarios = [
  { id: 1, nome: "Maria", dataNascimento: "1984-11-01" },
  { id: 2, nome: "Joao", dataNascimento: "1980-01-16" },
  { id: 3, nome: "Jose", dataNascimento: "1998-06-06" },
];

const AWS = require("aws-sdk");
const DateFromTime = require("es-abstract/5/datefromtime");
const { v4: uuidv4 } = require("uuid");

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const params = {
  TableName: "USUARIOS",
};

module.exports.listarUsuarios = async (event) => {
  try {
    let data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.obterUsuario = async (event) => {
  try {
    const { usuarioId } = event.pathParameters;

    const data = await dynamoDb
      .get({
        ...params,
        Key: {
          usuario_id: usuarioId,
        },
      })
      .promise();

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Usuário não existe" }, null, 2),
      };
    }

    const usuario = data.Item;

    return {
      statusCode: 200,
      body: JSON.stringify(usuario, null, 2),
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.cadastrarUsuario = async (event) => {
  try {
    const timestamp = new Date().getTime();

    let dados = JSON.parse(event.body);

    const { nome, data_nascimento, email, telefone } = dados;

    const usuario = {
      usuario_id: uuidv4(),
      nome,
      data_nascimento,
      email,
      telefone,
      status: true,
      criado_em: timestamp,
      atualizado_em: timestamp,
    };

    await dynamoDb
      .put({
        TableName: "USUARIOS",
        Item: usuario,
      })
      .promise();

    return {
      statusCode: 201,
    };
  } catch (err) {
    console.log("Error", err);
    return {
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : "Exception",
        message: err.message ? err.message : "Unknown error",
      }),
    };
  }
};

module.exports.atualizarUsuario = async (event) => {
  const {usuarioId} = event.pathParameters

  try {
    const timestamp = new Date().getTime()

    let dados = JSON.parse(event.body)

    const { nome, data_nascimento, email, telefone} = dados

    await dynamoDb
    .update({
      ... params,
      Key: {
        usuario_id: usuarioId
      },
      UpdateExpression:
      'SET nome = :nome, data_nascimento = :dt, email = :email, telefone= :telefone, atualizado_em = :atualizado_em',
      ConditionExpression: 'attribute_exists(usuario_id)',
      ExpressionAttributeValues: {
        ':nome': nome,
        ':dt': data_nascimento,
        ':email': email,
        ':telefone': telefone,
        ':atualizado_em': timestamp
      }
    })
    .promise()
    
    return{
      statusCode: 204,
    };
  } catch (err) {console.log("Error", err);

    let error = err.name ? err.name : "Exception";
    let message = err.message ? err.message : "Unknown error";
    let statusCode = err.statusCode ? err.statusCode : 500;

    if(error == 'ConditionalCheckFailedException') {
      error = 'Paciente não existe';
      message = 'Recurso com o ID ${pacienteId} não existe e não pode ser atualizado';
      statusCode = 404;
    }

    return {
      statusCode,
      body: JSON.stringify({
        error,
        message
      }),
    };
  }
}
