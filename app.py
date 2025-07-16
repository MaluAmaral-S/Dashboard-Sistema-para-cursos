
from flask import Flask, render_template, request, redirect, url_for
import sqlite3


app = Flask(__name__)
DB_NAME = "Instituto.db"


@app.route('/', methods=['GET', 'POST'])
def homepage():
    
    if request.method == 'POST':
        
        nome = request.form['nome_do_curso']
        ano = request.form['ano_inicio']
        mes = request.form['mes_inicio']
        duracao = request.form['duracao']

        try:
            
            conexao = sqlite3.connect(DB_NAME)
            cursor = conexao.cursor()

           
            comando_sql = "INSERT INTO Cursos (nome_do_curso, ano_inicio, mes_inicio, duracao) VALUES (?, ?, ?, ?)"
            
           
            cursor.execute(comando_sql, (nome, ano, mes, duracao))
            
           
            conexao.commit()
            
        except sqlite3.Error as e:
            
            print(f"Erro ao inserir no banco de dados: {e}")
        
        finally:
            
            
                conexao.close()
        
       
        return redirect(url_for('homepage'))

    
    return render_template('index.html')


if __name__ == '__main__':
    
    app.run(debug=True)