const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Biblioteca API',
    version: '1.0.0',
    description:
      'API de gerenciamento de biblioteca com CRUD de livros, usuários e autenticação JWT.\n\n' +
      'Endpoints de escrita em usuários (POST/PUT/DELETE) são restritos a administradores.',
  },
  servers: [
    {
      url: 'http://localhost:3333/api',
      description: 'Servidor local',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Autenticação' },
    { name: 'Books', description: 'Operações com livros' },
    { name: 'Users', description: 'Operações com usuários' },
  ],
  paths: {
    '/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        description: 'Autentica um usuário e retorna um token JWT.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
              example: {
                email: 'admin@biblioteca.com',
                password: 'admin123',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login bem-sucedido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' },
              },
            },
          },
          401: {
            description: 'Credenciais inválidas',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Email ou senha inválidos' },
              },
            },
          },
        },
      },
    },

    '/books': {
      get: {
        tags: ['Books'],
        summary: 'Listar livros',
        description: 'Retorna a lista completa de livros cadastrados.',
        responses: {
          200: {
            description: 'Lista de livros',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Book' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Books'],
        summary: 'Criar livro',
        description: 'Cadastra um novo livro na biblioteca.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookInput' },
              example: {
                title: 'O Primo Basílio',
                author: 'José Maria de Eça de Queirós',
                year: 1878,
                available: true,
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Livro criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Book' },
              },
            },
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' },
              },
            },
          },
        },
      },
    },

    '/books/{id}': {
      get: {
        tags: ['Books'],
        summary: 'Buscar livro por ID',
        description: 'Retorna os detalhes de um livro específico.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do livro',
          },
        ],
        responses: {
          200: {
            description: 'Livro encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Book' },
              },
            },
          },
          404: {
            description: 'Livro não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Livro não encontrado' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Books'],
        summary: 'Atualizar livro',
        description: 'Atualiza completamente os dados de um livro.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do livro',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/BookInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Livro atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Book' },
              },
            },
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' },
              },
            },
          },
          404: {
            description: 'Livro não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Books'],
        summary: 'Remover livro',
        description: 'Remove um livro da biblioteca.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do livro',
          },
        ],
        responses: {
          204: {
            description: 'Removido com sucesso',
          },
          404: {
            description: 'Livro não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    '/users': {
      get: {
        tags: ['Users'],
        summary: 'Listar usuários',
        description:
          'Retorna a lista de usuários cadastrados (sem expor a senha). Requer autenticação.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Lista de usuários',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/User' },
                },
              },
            },
          },
          401: {
            description: 'Token não fornecido ou inválido',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Token não fornecido' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Criar usuário',
        description: 'Cadastra um novo usuário. Apenas administradores podem executar essa ação.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserInput' },
              example: {
                name: 'João Silva',
                email: 'joao@email.com',
                password: 'senha123',
                role: 'user',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Usuário criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' },
              },
            },
          },
          401: {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          403: {
            description: 'Acesso negado — apenas administradores',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Acesso restrito a administradores' },
              },
            },
          },
          409: {
            description: 'Email já cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Email já cadastrado' },
              },
            },
          },
        },
      },
    },

    '/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Buscar usuário por ID',
        description: 'Retorna os dados de um usuário específico (sem expor a senha).',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do usuário',
          },
        ],
        responses: {
          200: {
            description: 'Usuário encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Usuário não encontrado' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Atualizar usuário',
        description:
          'Atualiza os dados de um usuário. Apenas administradores podem executar essa ação.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do usuário',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserUpdateInput' },
              example: {
                name: 'João Silva Atualizado',
                email: 'joao.novo@email.com',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Usuário atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          400: {
            description: 'Dados inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ValidationError' },
              },
            },
          },
          401: {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          403: {
            description: 'Acesso negado — apenas administradores',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          409: {
            description: 'Email já cadastrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Email já cadastrado' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Remover usuário',
        description:
          'Remove um usuário do sistema. Apenas administradores podem executar essa ação.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do usuário',
          },
        ],
        responses: {
          204: {
            description: 'Removido com sucesso',
          },
          401: {
            description: 'Não autenticado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          403: {
            description: 'Acesso negado — apenas administradores',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Usuário não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },
  },

  components: {
    schemas: {
      Book: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          title: { type: 'string', example: 'O Primo Basílio' },
          author: { type: 'string', example: 'José Maria de Eça de Queirós' },
          year: { type: 'integer', example: 1878 },
          available: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BookInput: {
        type: 'object',
        required: ['title', 'author', 'year'],
        properties: {
          title: { type: 'string', minLength: 1, example: 'Dom Casmurro' },
          author: { type: 'string', minLength: 1, example: 'Machado de Assis' },
          year: { type: 'integer', example: 1899 },
          available: { type: 'boolean', default: true, example: false },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Admin' },
          email: { type: 'string', format: 'email', example: 'admin@biblioteca.com' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'admin' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UserInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 1, example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          password: { type: 'string', minLength: 6, example: 'senha123' },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user', example: 'user' },
        },
      },
      UserUpdateInput: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, example: 'João Silva' },
          email: { type: 'string', format: 'email', example: 'joao@email.com' },
          password: { type: 'string', minLength: 6, example: 'novaSenha456' },
          role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@biblioteca.com' },
          password: { type: 'string', example: 'admin123' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          token: {
            type: 'string',
            example:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensagem de erro' },
        },
      },
      ValidationError: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Dados inválidos' },
          issues: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string', example: 'email' },
                message: { type: 'string', example: 'Email inválido' },
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtido no endpoint POST /login',
      },
    },
  },
};

export default swaggerSpec;
