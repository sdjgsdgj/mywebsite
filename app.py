from flask import Flask, redirect, url_for, render_template, send_from_directory
from hours.views import views as hours_views
from material.views import views as material_views
app = Flask(__name__)
app.register_blueprint(hours_views, url_prefix="/hours")
app.register_blueprint(material_views, url_prefix="/material")

@app.route("/")
def home():
    return render_template('home.html')

@app.route('/serve_static/<path:filename>')
def serve_static(filename):
    return send_from_directory(f'', filename)

if __name__ == "__main__":
    app.run(host='192.168.0.46', port='8000', debug=True)
