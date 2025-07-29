import sqlite3
import random
from faker import Faker

# Inicializa o Faker para gerar dados em português do Brasil
fake = Faker('pt_BR')

DB_NAME = "Instituto.db"

def run_script():
    """Função principal para popular o banco de dados."""
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()

        print("Conectado ao banco de dados. Iniciando a inserção de dados...")

        # --- 1. Limpar dados existentes ---
        # A ordem é importante para não violar as chaves estrangeiras
        print("Limpando tabelas existentes...")
        cursor.execute("DELETE FROM Alunos")
        cursor.execute("DELETE FROM Turmas")
        cursor.execute("DELETE FROM Ciclos")
        cursor.execute("DELETE FROM Cursos")
        # Reseta os contadores de autoincremento
        cursor.execute("DELETE FROM sqlite_sequence")
        print("Tabelas limpas com sucesso.")

        # --- 2. Criar Cursos ---
        print("Criando cursos...")
        cursos = [
            ('Inteligencia Artificial', 'bx bxs-brain', 'prog-icon'),
            ('Programação Web', 'bx bx-code-alt', 'ai-icon'),
            ('Design Gráfico', 'bx bxs-paint', 'info-icon'),
            ('Redes de Computadores', 'bx bx-git-branch', 'success-icon'),
            ('Marketing Digital', 'bx bx-trending-up', 'creative-icon')
        ]
        cursor.executemany("INSERT INTO Cursos (nome_do_curso, icone, icone_cor_classe) VALUES (?, ?, ?)", cursos)
        
        # Recupera os IDs dos cursos criados
        cursos_ids = {nome: id for id, nome in cursor.execute("SELECT id, nome_do_curso FROM Cursos").fetchall()}
        print(f"{len(cursos_ids)} cursos criados.")

        # --- 3. Criar Ciclos e Turmas ---
        print("Criando ciclos e turmas...")
        turmas_criadas = []
        for nome_curso, curso_id in cursos_ids.items():
            # Cria 1 ciclo para cada curso
            nome_ciclo = "Ciclo 2025.1"
            cursor.execute("INSERT INTO Ciclos (curso_id, nome_ciclo, ano_inicio, mes_inicio, duracao) VALUES (?, ?, ?, ?, ?)",
                           (curso_id, nome_ciclo, 2025, 8, 6))
            ciclo_id = cursor.lastrowid

            # Cria 2 turmas para cada ciclo
            for i in range(1, 3):
                nome_turma = f"Turma {'Manhã' if i == 1 else 'Tarde'}"
                horario_inicio = "08:00" if i == 1 else "14:00"
                horario_fim = "12:00" if i == 1 else "18:00"
                limite_alunos = random.randint(15, 25)
                
                # Garante que o limite da turma de IA seja pelo menos 20
                if nome_curso == 'Inteligencia Artificial' and i == 1:
                    limite_alunos = 20

                cursor.execute("""
                    INSERT INTO Turmas (curso_id, ciclo_id, nome_turma, limite_alunos, data_inicio, horario_inicio, horario_fim, dias_semana)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (curso_id, ciclo_id, nome_turma, limite_alunos, '2025-08-01', horario_inicio, horario_fim, 'Seg, Qua, Sex'))
                
                turma_id = cursor.lastrowid
                turmas_criadas.append({'id': turma_id, 'curso_id': curso_id, 'nome_curso': nome_curso, 'nome_turma': nome_turma})
        
        print(f"{len(turmas_criadas)} turmas criadas.")

        # --- 4. Criar Alunos ---
        print("Criando alunos...")
        # Encontra a turma específica de IA
        turma_ia_id = None
        curso_ia_id = cursos_ids.get('Inteligencia Artificial')
        
        for turma in turmas_criadas:
            if turma['curso_id'] == curso_ia_id and turma['nome_turma'] == 'Turma Manhã':
                turma_ia_id = turma['id']
                break

        # **Adiciona 20 alunos à turma de Inteligência Artificial**
        if turma_ia_id and curso_ia_id:
            print("Adicionando 20 alunos à turma de Inteligência Artificial...")
            for _ in range(20):
                nome_completo = fake.name()
                cursor.execute("""
                    INSERT INTO Alunos (nome, idade, data_nascimento, cpf, rg, telefone, endereco, nome_mae, nome_pai, escola, curso_id, turma_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    nome_completo, random.randint(18, 35), fake.date_of_birth(minimum_age=18, maximum_age=35).isoformat(),
                    fake.cpf(), fake.rg(), fake.phone_number(), fake.address(),
                    fake.name_female(), fake.name_male(), 'Colégio Estadual Exemplo', curso_ia_id, turma_ia_id
                ))
            print("20 alunos adicionados com sucesso!")

        # Adiciona alguns alunos aleatórios às outras turmas
        print("Adicionando alunos aleatórios às outras turmas...")
        for turma in turmas_criadas:
            # Pula a turma de IA que já está cheia
            if turma['id'] == turma_ia_id:
                continue
            
            # Adiciona de 5 a 15 alunos por turma
            num_alunos_aleatorios = random.randint(5, 15)
            for _ in range(num_alunos_aleatorios):
                nome_completo = fake.name()
                cursor.execute("""
                    INSERT INTO Alunos (nome, idade, data_nascimento, cpf, rg, telefone, endereco, nome_mae, nome_pai, escola, curso_id, turma_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    nome_completo, random.randint(18, 35), fake.date_of_birth(minimum_age=18, maximum_age=35).isoformat(),
                    fake.cpf(), fake.rg(), fake.phone_number(), fake.address(),
                    fake.name_female(), fake.name_male(), 'Colégio Estadual Exemplo', turma['curso_id'], turma['id']
                ))
        print("Alunos aleatórios adicionados.")

        # --- 5. Finalizar ---
        conn.commit()
        print("Dados inseridos e salvos no banco de dados!")

    except sqlite3.Error as e:
        print(f"Ocorreu um erro de banco de dados: {e}")
    finally:
        if conn:
            conn.close()
            print("Conexão com o banco de dados fechada.")

# Executa o script
if __name__ == '__main__':
    run_script()