from flask import Flask, render_template, request, redirect, url_for, jsonify
import sqlite3

app = Flask(__name__)
DB_NAME = "Instituto.db"

def init_db():
    """
    Inicializa o banco de dados SQLite, criando as tabelas
    'Cursos', 'Ciclos', 'Turmas' e 'Alunos' se elas não existirem.
    Define as chaves primárias e estrangeiras para garantir a integridade dos dados.
    """
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        # Tabela Cursos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Cursos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_do_curso TEXT NOT NULL,
                ano_inicio INTEGER,
                mes_inicio INTEGER,
                duracao INTEGER
            )
        ''')
        # Tabela Ciclos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Ciclos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome_ciclo TEXT NOT NULL UNIQUE
            )
        ''')
        # Tabela Turmas (com chave estrangeira para Cursos e Ciclos)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Turmas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                curso_id INTEGER NOT NULL,
                ciclo_id INTEGER NOT NULL,
                nome_turma TEXT NOT NULL,
                limite_alunos INTEGER,
                data_inicio TEXT,
                horario_inicio TEXT,
                horario_fim TEXT,
                dias_semana TEXT,
                FOREIGN KEY (curso_id) REFERENCES Cursos(id),
                FOREIGN KEY (ciclo_id) REFERENCES Ciclos(id)
            )
        ''')
        # Tabela Alunos (com chaves estrangeiras para Cursos e Turmas)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS Alunos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                idade INTEGER,
                data_nascimento TEXT,
                cpf TEXT UNIQUE,
                rg TEXT,
                telefone TEXT,
                endereco TEXT,
                nome_mae TEXT,
                nome_pai TEXT,
                escola TEXT,
                curso_id INTEGER NOT NULL,
                turma_id INTEGER NOT NULL,
                data_inscricao TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (curso_id) REFERENCES Cursos(id),
                FOREIGN KEY (turma_id) REFERENCES Turmas(id)
            )
        ''')
        conn.commit()

@app.route('/', methods=['GET'])
def homepage():
    """
    Renderiza a página inicial do dashboard.
    """
    return render_template('index.html')

@app.route('/cursos', methods=['POST'])
def criar_curso():
    """
    Cria um novo curso no banco de dados.
    Espera dados JSON no corpo da requisição.
    """
    if request.method == 'POST':
        data = request.json # Pega os dados JSON da requisição
        nome = data.get('nome_do_curso')
        ano = data.get('ano_inicio')
        mes = data.get('mes_inicio')
        duracao = data.get('duracao')

        # Validação básica dos campos obrigatórios
        if not all([nome, ano, mes, duracao]):
            return jsonify({"message": "Todos os campos do curso são obrigatórios!", "success": False}), 400

        try:
            with sqlite3.connect(DB_NAME) as conexao:
                cursor = conexao.cursor()
                comando_sql = "INSERT INTO Cursos (nome_do_curso, ano_inicio, mes_inicio, duracao) VALUES (?, ?, ?, ?)"
                cursor.execute(comando_sql, (nome, ano, mes, duracao))
                conexao.commit()
                return jsonify({"message": "Curso criado com sucesso!", "success": True}), 201
        except sqlite3.Error as e:
            print(f"Erro ao inserir curso no banco de dados: {e}")
            return jsonify({"message": f"Erro ao criar curso: {e}", "success": False}), 500

@app.route('/api/cursos', methods=['GET'])
def get_cursos():
    """
    Retorna uma lista de todos os cursos cadastrados.
    """
    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            cursor.execute("SELECT id, nome_do_curso, ano_inicio, mes_inicio, duracao FROM Cursos")
            cursos = cursor.fetchall()
            # Converte os resultados para um formato JSON amigável
            return jsonify([{"id": c[0], "nome_do_curso": c[1], "ano_inicio": c[2], "mes_inicio": c[3], "duracao": c[4]} for c in cursos])
    except sqlite3.Error as e:
        print(f"Erro ao buscar cursos: {e}")
        return jsonify({"message": f"Erro ao buscar cursos: {e}", "success": False}), 500

@app.route('/api/cursos/<int:curso_id>', methods=['DELETE'])
def deletar_curso(curso_id):
    """
    Deleta um curso específico pelo ID.
    """
    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            cursor.execute("DELETE FROM Cursos WHERE id = ?", (curso_id,))
            conexao.commit()
            return jsonify({"message": "Curso excluído com sucesso!", "success": True}), 200
    except sqlite3.Error as e:
        print(f"Erro ao deletar curso: {e}")
        return jsonify({"message": f"Erro ao deletar curso: {e}", "success": False}), 500

@app.route('/api/ciclos', methods=['GET'])
def get_ciclos():
    """
    Retorna uma lista de todos os ciclos cadastrados.
    """
    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            cursor.execute("SELECT id, nome_ciclo FROM Ciclos ORDER BY id ASC")
            ciclos = cursor.fetchall()
            return jsonify([{"id": c[0], "nome_ciclo": c[1]} for c in ciclos])
    except sqlite3.Error as e:
        print(f"Erro ao buscar ciclos: {e}")
        return jsonify({"message": f"Erro ao buscar ciclos: {e}", "success": False}), 500

@app.route('/api/ciclos', methods=['POST'])
def criar_ciclo():
    """
    Cria um novo ciclo no banco de dados.
    Espera dados JSON com 'nome_ciclo'.
    """
    data = request.json
    nome_ciclo = data.get('nome_ciclo')
    if not nome_ciclo:
        return jsonify({"message": "Nome do ciclo é obrigatório!", "success": False}), 400

    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            cursor.execute("INSERT INTO Ciclos (nome_ciclo) VALUES (?)", (nome_ciclo,))
            conexao.commit()
            # Retorna o ID do ciclo recém-criado
            return jsonify({"message": "Ciclo criado com sucesso!", "success": True, "id": cursor.lastrowid, "nome_ciclo": nome_ciclo}), 201
    except sqlite3.IntegrityError:
        # Erro de integridade ocorre se o nome do ciclo já existe (UNIQUE constraint)
        return jsonify({"message": "Ciclo com este nome já existe.", "success": False}), 409
    except sqlite3.Error as e:
        print(f"Erro ao criar ciclo: {e}")
        return jsonify({"message": f"Erro ao criar ciclo: {e}", "success": False}), 500

@app.route('/api/turmas', methods=['POST'])
def criar_turma():
    """
    Cria uma nova turma no banco de dados, associando-a a um curso e ciclo.
    Espera dados JSON com todos os detalhes da turma.
    """
    data = request.json
    curso_id = data.get('curso_id')
    ciclo_id = data.get('ciclo_id')
    nome_turma = data.get('nome_turma')
    limite_alunos = data.get('limite_alunos')
    data_inicio = data.get('data_inicio')
    horario_inicio = data.get('horario_inicio')
    horario_fim = data.get('horario_fim')
    dias_semana = data.get('dias_semana')

    # Validação de todos os campos obrigatórios
    if not all([curso_id, ciclo_id, nome_turma, limite_alunos, data_inicio, horario_inicio, horario_fim, dias_semana]):
        return jsonify({"message": "Todos os campos da turma são obrigatórios!", "success": False}), 400

    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            comando_sql = """
                INSERT INTO Turmas (curso_id, ciclo_id, nome_turma, limite_alunos, data_inicio, horario_inicio, horario_fim, dias_semana)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(comando_sql, (curso_id, ciclo_id, nome_turma, limite_alunos, data_inicio, horario_inicio, horario_fim, dias_semana))
            conexao.commit()
            return jsonify({"message": "Turma criada com sucesso!", "success": True}), 201
    except sqlite3.Error as e:
        print(f"Erro ao criar turma: {e}")
        return jsonify({"message": f"Erro ao criar turma: {e}", "success": False}), 500

@app.route('/api/turmas', methods=['GET'])
def get_turmas():
    """
    Retorna uma lista de todas as turmas cadastradas, incluindo informações
    do curso e ciclo associados, e a contagem de alunos inscritos.
    """
    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            cursor.execute("""
                SELECT
                    T.id,
                    C.nome_do_curso,
                    CI.nome_ciclo,
                    T.nome_turma,
                    T.limite_alunos,
                    T.data_inicio,
                    T.horario_inicio,
                    T.horario_fim,
                    T.dias_semana,
                    (SELECT COUNT(*) FROM Alunos WHERE turma_id = T.id) as alunos_inscritos
                FROM Turmas T
                JOIN Cursos C ON T.curso_id = C.id
                JOIN Ciclos CI ON T.ciclo_id = CI.id
            """)
            turmas = cursor.fetchall()
            turmas_list = []
            for t in turmas:
                turmas_list.append({
                    "id": t[0],
                    "curso_nome": t[1],
                    "ciclo_nome": t[2],
                    "nome_turma": t[3],
                    "limite_alunos": t[4],
                    "data_inicio": t[5],
                    "horario_inicio": t[6],
                    "horario_fim": t[7],
                    "dias_semana": t[8],
                    "alunos_inscritos": t[9]
                })
            return jsonify(turmas_list)
    except sqlite3.Error as e:
        print(f"Erro ao buscar turmas: {e}")
        return jsonify({"message": f"Erro ao buscar turmas: {e}", "success": False}), 500

@app.route('/api/turmas/por_curso_ciclo', methods=['GET'])
def get_turmas_por_curso_e_ciclo():
    """
    Retorna turmas filtradas por ID de curso e ID de ciclo.
    Usado para popular o dropdown de turmas na tela de inscrição de alunos.
    """
    curso_id = request.args.get('curso_id')
    ciclo_id = request.args.get('ciclo_id')

    if not curso_id or not ciclo_id:
        return jsonify({"message": "IDs de curso e ciclo são obrigatórios para buscar turmas.", "success": False}), 400

    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            cursor.execute("""
                SELECT id, nome_turma, limite_alunos
                FROM Turmas
                WHERE curso_id = ? AND ciclo_id = ?
            """, (curso_id, ciclo_id))
            turmas = cursor.fetchall()
            return jsonify([{"id": t[0], "nome_turma": t[1], "limite_alunos": t[2]} for t in turmas])
    except sqlite3.Error as e:
        print(f"Erro ao buscar turmas por curso e ciclo: {e}")
        return jsonify({"message": f"Erro ao buscar turmas: {e}", "success": False}), 500

@app.route('/api/alunos', methods=['POST'])
def inscrever_aluno():
    """
    Inscreve um novo aluno no banco de dados.
    Espera dados JSON com as informações do aluno e os IDs de curso/turma.
    """
    data = request.json
    nome = data.get('nome')
    idade = data.get('idade')
    data_nascimento = data.get('data_nascimento')
    cpf = data.get('cpf')
    rg = data.get('rg')
    telefone = data.get('telefone')
    endereco = data.get('endereco')
    nome_mae = data.get('nome_mae')
    nome_pai = data.get('nome_pai')
    escola = data.get('escola')
    curso_id = data.get('curso_id')
    turma_id = data.get('turma_id')

    # Validação de campos obrigatórios do aluno
    if not all([nome, idade, data_nascimento, cpf, rg, telefone, endereco, nome_mae, curso_id, turma_id]):
        return jsonify({"message": "Campos obrigatórios do aluno não preenchidos!", "success": False}), 400

    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            comando_sql = """
                INSERT INTO Alunos (nome, idade, data_nascimento, cpf, rg, telefone, endereco, nome_mae, nome_pai, escola, curso_id, turma_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """
            cursor.execute(comando_sql, (nome, idade, data_nascimento, cpf, rg, telefone, endereco, nome_mae, nome_pai, escola, curso_id, turma_id))
            conexao.commit()
            return jsonify({"message": "Aluno inscrito com sucesso!", "success": True}), 201
    except sqlite3.IntegrityError:
        # Erro se o CPF já estiver cadastrado
        return jsonify({"message": "CPF já cadastrado!", "success": False}), 409
    except sqlite3.Error as e:
        print(f"Erro ao inscrever aluno: {e}")
        return jsonify({"message": f"Erro ao inscrever aluno: {e}", "success": False}), 500

@app.route('/api/alunos', methods=['GET'])
def get_alunos():
    """
    Retorna uma lista de todos os alunos cadastrados, incluindo informações
    do curso e turma em que estão inscritos.
    """
    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            cursor.execute("""
                SELECT
                    A.id, A.nome, A.cpf, A.telefone, C.nome_do_curso, T.nome_turma, A.data_inscricao
                FROM Alunos A
                JOIN Cursos C ON A.curso_id = C.id
                JOIN Turmas T ON A.turma_id = T.id
            """)
            alunos = cursor.fetchall()
            alunos_list = []
            for a in alunos:
                alunos_list.append({
                    "id": a[0], "nome": a[1], "cpf": a[2], "telefone": a[3],
                    "curso": a[4], "turma": a[5], "data_inscricao": a[6]
                })
            return jsonify(alunos_list)
    except sqlite3.Error as e:
        print(f"Erro ao buscar alunos: {e}")
        return jsonify({"message": f"Erro ao buscar alunos: {e}", "success": False}), 500

@app.route('/api/dashboard_stats', methods=['GET'])
def get_dashboard_stats():
    """
    Retorna estatísticas gerais para o dashboard, como total de alunos,
    turmas, cursos, e listas de turmas e cursos populares.
    """
    try:
        with sqlite3.connect(DB_NAME) as conexao:
            cursor = conexao.cursor()
            
            # Total de Alunos
            cursor.execute("SELECT COUNT(*) FROM Alunos")
            total_alunos = cursor.fetchone()[0]
            
            # Total de Turmas
            cursor.execute("SELECT COUNT(*) FROM Turmas")
            total_turmas = cursor.fetchone()[0]
            
            # Total de Cursos
            cursor.execute("SELECT COUNT(*) FROM Cursos")
            total_cursos = cursor.fetchone()[0]

            # Turmas Populares (com contagem de alunos e limite)
            cursor.execute("""
                SELECT T.nome_turma, COUNT(A.id) AS num_alunos, T.limite_alunos
                FROM Turmas T
                LEFT JOIN Alunos A ON T.id = A.turma_id
                GROUP BY T.id
                ORDER BY num_alunos DESC
                LIMIT 5
            """)
            turmas_populares = cursor.fetchall()

            # Cursos Populares (com total de alunos)
            cursor.execute("""
                SELECT C.nome_do_curso, COUNT(A.id) AS num_alunos
                FROM Cursos C
                LEFT JOIN Alunos A ON C.id = A.curso_id
                GROUP BY C.id
                ORDER BY num_alunos DESC
                LIMIT 5
            """)
            cursos_populares = cursor.fetchall()

            return jsonify({
                "total_alunos": total_alunos,
                "total_turmas": total_turmas,
                "total_cursos": total_cursos,
                "turmas_populares": [{"nome": t[0], "alunos": t[1], "limite": t[2]} for t in turmas_populares],
                "cursos_populares": [{"nome": c[0], "total_alunos": c[1]} for c in cursos_populares]
            })
    except sqlite3.Error as e:
        print(f"Erro ao buscar estatísticas do dashboard: {e}")
        return jsonify({"message": f"Erro ao buscar estatísticas do dashboard: {e}", "success": False}), 500

if __name__ == '__main__':
    # Garante que o banco de dados e as tabelas são criados ao iniciar o aplicativo
    init_db() 
    app.run(debug=True)
