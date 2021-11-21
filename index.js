const moment = require('moment')

const usuarios = [
    {id: 1, nome: "Vinicius", dataNascimento: '1997-26-12'},
    {id: 2, nome: "Joao", dataNascimento: '1983-09-16'},
    {id: 3, nome: "Jose", dataNascimento: '1959-07-15'}
];

function buscarUsuario(campo, valor) {
    return usuarios.find(usuario => usuario[campo] == valor);
}

function calcularIdade(usuario) {
    const hoje = moment()
    const dataNascimento = moment(usuario.dataNascimento, 'YYYY-MM-DD')
    
    return hoje.diff(dataNascimento, 'years')
}

exports.handler = async (event) => {
    console.log("Usuario informado: " + event.usuarioId);

    let usuarioEncontrado = usuarios

    if (event.pacienteId) 
      usuarioEncontrado = buscarUsuario('id', event.filtros.usuarioId)
      usuarioEncontrado = calcularIdade(usuarioEncontrado)

    const response = {
        statusCode: 200,
        body: JSON.stringify(usuarioEncontrado),
    };
    
    const todosUsuarios = usuarios.map(p =>({ ...p, idade: calcularIdade(p) }))
    return response;
};