const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Biblioteca API',
    version: '1.0.0',
    description:
      'API de gerenciamento de biblioteca com CRUD de livros, autores, categorias, usuários e autenticação JWT.\n\n' +
      'Endpoints de escrita em usuários, categorias e autores (POST/PUT/DELETE) são restritos a administradores.\n\n' +
      'A listagem de livros aceita os parâmetros opcionais ?categoryId=N e ?authorId=N para filtrar.',
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
    { name: 'Authors', description: 'Operações com autores' },
    { name: 'Categories', description: 'Operações com categorias' },
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
        description: 'Retorna a lista de livros. Aceita ?categoryId=N e/ou ?authorId=N para filtrar.',
        parameters: [
          {
            name: 'categoryId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Filtrar por ID da categoria',
          },
          {
            name: 'authorId',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Filtrar por ID do autor',
          },
        ],
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
                authorId: 1,
                year: 1878,
                available: true,
                categoryId: 1,
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

    '/authors': {
      get: {
        tags: ['Authors'],
        summary: 'Listar autores',
        description: 'Retorna a lista de autores cadastrados.',
        responses: {
          200: {
            description: 'Lista de autores',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Author' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Authors'],
        summary: 'Criar autor',
        description: 'Cadastra um novo autor. Apenas administradores.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthorInput' },
              example: { name: 'Clarice Lispector' },
            },
          },
        },
        responses: {
          201: {
            description: 'Autor criado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Author' },
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
            description: 'Acesso negado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Acesso restrito a administradores' },
              },
            },
          },
          409: {
            description: 'Autor já existe',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Autor já existe' },
              },
            },
          },
        },
      },
    },

    '/authors/{id}': {
      get: {
        tags: ['Authors'],
        summary: 'Buscar autor por ID',
        description: 'Retorna os dados de um autor específico.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do autor',
          },
        ],
        responses: {
          200: {
            description: 'Autor encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Author' },
              },
            },
          },
          404: {
            description: 'Autor não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Autor não encontrado' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Authors'],
        summary: 'Atualizar autor',
        description: 'Atualiza os dados de um autor. Apenas administradores.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do autor',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthorInput' },
              example: { name: 'Clarice Lispector' },
            },
          },
        },
        responses: {
          200: {
            description: 'Autor atualizado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Author' },
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
            description: 'Acesso negado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Autor não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          409: {
            description: 'Autor já existe',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Authors'],
        summary: 'Remover autor',
        description: 'Remove um autor. Apenas administradores.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID do autor',
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
            description: 'Acesso negado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Autor não encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Listar categorias',
        description: 'Retorna a lista de categorias cadastradas.',
        responses: {
          200: {
            description: 'Lista de categorias',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Category' },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Criar categoria',
        description: 'Cadastra uma nova categoria. Apenas administradores.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryInput' },
              example: { name: 'Policial' },
            },
          },
        },
        responses: {
          201: {
            description: 'Categoria criada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Category' },
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
            description: 'Acesso negado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Acesso restrito a administradores' },
              },
            },
          },
          409: {
            description: 'Categoria já existe',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Categoria já existe' },
              },
            },
          },
        },
      },
    },

    '/categories/{id}': {
      get: {
        tags: ['Categories'],
        summary: 'Buscar categoria por ID',
        description: 'Retorna os dados de uma categoria específica.',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID da categoria',
          },
        ],
        responses: {
          200: {
            description: 'Categoria encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Category' },
              },
            },
          },
          404: {
            description: 'Categoria não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
                example: { error: 'Categoria não encontrada' },
              },
            },
          },
        },
      },
      put: {
        tags: ['Categories'],
        summary: 'Atualizar categoria',
        description: 'Atualiza os dados de uma categoria. Apenas administradores.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID da categoria',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryInput' },
              example: { name: 'Suspense' },
            },
          },
        },
        responses: {
          200: {
            description: 'Categoria atualizada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Category' },
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
            description: 'Acesso negado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Categoria não encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          409: {
            description: 'Categoria já existe',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Remover categoria',
        description: 'Remove uma categoria. Apenas administradores.',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
            description: 'ID da categoria',
          },
        ],
        responses: {
          204: {
            description: 'Removida com sucesso',
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
            description: 'Acesso negado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
          404: {
            description: 'Categoria não encontrada',
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
          year: { type: 'integer', example: 1878 },
          available: { type: 'boolean', example: true },
          authorId: { type: 'integer', example: 1 },
          Author: { $ref: '#/components/schemas/Author' },
          categoryId: { type: 'integer', example: 1, nullable: true },
          Category: { $ref: '#/components/schemas/Category' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      BookInput: {
        type: 'object',
        required: ['title', 'authorId', 'year'],
        properties: {
          title: { type: 'string', minLength: 1, example: 'Dom Casmurro' },
          authorId: { type: 'integer', example: 1 },
          year: { type: 'integer', example: 1899 },
          available: { type: 'boolean', default: true, example: false },
          categoryId: { type: 'integer', example: 1, nullable: true },
        },
      },
      Author: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Machado de Assis' },
        },
      },
      AuthorInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, example: 'Clarice Lispector' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Clássico' },
        },
      },
      CategoryInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1, example: 'Policial' },
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
