'use strict';

const usuarios = [
  {id: 1, nome: "Vinicius", dataNascimento: '1997-26-12'},
  {id: 2, nome: "Joao", dataNascimento: '1983-09-16'},
  {id: 3, nome: "Jose", dataNascimento: '1959-07-15'}
];

const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient()
const params = {
  TableName: 'PACIENTES'
}

module.exports.listarUsuarios = async (event) => {
  try {
    let data = await dynamoDb.scan(params).promise()

    return{
      statusCode: 200,
      body: JSON.stringify(data)
    }
  } catch (err) {
    console.log('Error', err)
    return{
      statusCode: err.statusCode ? err.statusCode : 500,
      body: JSON.stringify({
        error: err.name ? err.name : 'Exception',
        message: err.message ? err.message : 'Unknown error'
      })
    }
  }
};

module.exports.obterUsuario = async (event) => {

  const { usuarioId } = event.pathParameters

  const usuario = usuarios.find(usuario => usuario.id == usuarioId)

  if(usuario === undefined){
    return{
      statusCode: 404,
      body:JSON.stringify({error: 'Usuário não existe'},null,2)
    }
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({usuario}, null, 2),
  }
};