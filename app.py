from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os




app = Flask(__name__, instance_relative_config=True)
app.config['DATABASE'] = os.path.join(app.instance_path, 'database.db')




# Ensure instance folder exists
if not os.path.exists(app.instance_path):
    os.makedirs(app.instance_path)




# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)




# ===== BEAT TABLE =====
class Beat(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    bpm = db.Column(db.Integer, nullable=True)
    genre = db.Column(db.String(80), nullable=True)
    moods = db.Column(db.String(255), nullable=True)
    filename = db.Column(db.String(255), nullable=False)




# ===== USER FAVORITES TABLE =====
class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    beat_id = db.Column(db.Integer, db.ForeignKey('beat.id'), nullable=False)





# ===== SEED BEATS =====
def seed_beats():


    beats_data = [

        {"name": "F♯ Minor Emotional Beat", "file": "beat-1.wav", "genre": "trap", "moods": ["chill"], "bpm": 100},
        {"name": "C Minor Emotional Beat", "file": "beat-2.wav", "genre": "drill", "moods": ["dark"], "bpm": 136},
        {"name": "A Minor Emotional Beat", "file": "beat-3.wav", "genre": "lofi", "moods": ["chill"], "bpm": 121},
        {"name": "D♯ Minor Emotional Beat", "file": "beat-4.wav", "genre": "trap", "moods": ["happy"], "bpm": 108},
        {"name": "D Minor Emotional Beat", "file": "beat-5.wav", "genre": "lofi", "moods": ["sad"], "bpm": 124},
        {"name": "A Major Emotional Beat", "file": "beat-6.wav", "genre": "lofi", "moods": ["chill"], "bpm": 78},
        {"name": "C♯ Minor Emotional Beat", "file": "beat-7.wav", "genre": "trap", "moods": ["dark"], "bpm": 70},
        {"name": "A Major Emotional Beat 2", "file": "beat-8.wav", "genre": "trap", "moods": ["happy"], "bpm": 89},
        {"name": "C♯ Minor Emotional Beat 2", "file": "beat-9.wav", "genre": "lofi", "moods": ["sad"], "bpm": 78},
        {"name": "E♭ Major Emotional Beat", "file": "beat-10.wav", "genre": "hip-hop", "moods": ["happy"], "bpm": 107},
        {"name": "C Minor Emotional Beat 2", "file": "beat-11.wav", "genre": "drill", "moods": ["dark"], "bpm": 142},
        {"name": "D Major Emotional Beat", "file": "beat-12.wav", "genre": "hip-hop", "moods": ["chill"], "bpm": 81},
        {"name": "C♯ Minor Emotional Beat 3", "file": "beat-13.wav", "genre": "lofi", "moods": ["happy"], "bpm": 75},
        {"name": "A♯ Minor Emotional Beat", "file": "beat-14.wav", "genre": "trap", "moods": ["dark"], "bpm": 73},
        {"name": "G♯ Minor Emotional Beat", "file": "beat-15.wav", "genre": "trap", "moods": ["dark"], "bpm": 119},
        {"name": "D♯ Minor Emotional Beat 2", "file": "beat-16.wav", "genre": "trap", "moods": ["sad"], "bpm": 82},
        {"name": "A♯ Minor Emotional Beat 2", "file": "beat-17.wav", "genre": "trap", "moods": ["dark"], "bpm": 107},
        {"name": "C Minor Emotional Beat 3", "file": "beat-18.wav", "genre": "drill", "moods": ["dark"], "bpm": 77},
        {"name": "D Minor Emotional Beat 2", "file": "beat-19.wav", "genre": "hip-hop", "moods": ["dark"], "bpm": 128},
        {"name": "D Minor Emotional Beat 3", "file": "beat-20.wav", "genre": "trap", "moods": ["dark"], "bpm": 70},
        {"name": "C Minor Emotional Beat 4", "file": "beat-21.wav", "genre": "drill", "moods": ["dark"], "bpm": 74},
        {"name": "F Minor Emotional Beat", "file": "beat-22.wav", "genre": "trap", "moods": ["happy"], "bpm": 100},
        {"name": "C♯ Minor Emotional Beat 4", "file": "beat-23.wav", "genre": "trap", "moods": ["dark"], "bpm": 107},

       ]







    added = 0
    for b in beats_data:
        exists = Beat.query.filter_by(name=b["name"]).first()
        if exists:
            continue
        beat = Beat(
            name=b["name"],
            bpm=b["bpm"],
            genre=b["genre"],
            moods=",".join(b["moods"]),
            filename=b["file"]
        )
        db.session.add(beat)
        added += 1

    if added > 0:
        db.session.commit()
        print(f"Seed: {added} new beats added.")
    else:
        # nothing to commit
        print("Seed: no new beats to add.")






# ===== API ENDPOINTS =====
@app.route('/api/get-beats', methods=['GET'])
def api_get_beats():
    
    all_flag = request.args.get("all", "").lower() == "true"

    favorite_records = Favorite.query.filter_by(user_id=1).all()
    favorite_ids = [f.beat_id for f in favorite_records]

    if all_flag:
        beats_query = Beat.query.all()
    else:
        if not favorite_ids:
            beats_query = []
        else:
            beats_query = Beat.query.filter(Beat.id.in_(favorite_ids)).all()

    beat_list = []
    favorite_names = []
    for b in beats_query:
        beat_list.append({
            "id": b.id,
            "name": b.name,
            "bpm": b.bpm,
            "genre": b.genre,
            "mood": b.moods,
            "file": f"/beats/{b.filename}",
            "favorite": b.id in favorite_ids
        })
        if b.id in favorite_ids:
            favorite_names.append(b.name)

    return jsonify({"beats": beat_list, "favoriteBeats": favorite_names})









@app.route('/api/add-favorite', methods=['POST'])
def api_add_favorite():
    data = request.get_json()
    beat_name = data.get("name")
    if not beat_name:
        return jsonify({"success": False, "message": "No beat name provided."}), 400

   
    beats_data = [
        {"name": "F♯ Minor Emotional Beat", "file": "beat-1.wav", "genre": "trap", "moods": ["chill"], "bpm": 100},
        {"name": "C Minor Emotional Beat", "file": "beat-2.wav", "genre": "drill", "moods": ["dark"], "bpm": 136},
        {"name": "A Minor Emotional Beat", "file": "beat-3.wav", "genre": "lofi", "moods": ["chill"], "bpm": 121},
        {"name": "D♯ Minor Emotional Beat", "file": "beat-4.wav", "genre": "trap", "moods": ["happy"], "bpm": 108},
        {"name": "D Minor Emotional Beat", "file": "beat-5.wav", "genre": "lofi", "moods": ["sad"], "bpm": 124},
        {"name": "A Major Emotional Beat", "file": "beat-6.wav", "genre": "lofi", "moods": ["chill"], "bpm": 78},
        {"name": "C♯ Minor Emotional Beat", "file": "beat-7.wav", "genre": "trap", "moods": ["dark"], "bpm": 70},
        {"name": "A Major Emotional Beat 2", "file": "beat-8.wav", "genre": "trap", "moods": ["happy"], "bpm": 89},
        {"name": "C♯ Minor Emotional Beat 2", "file": "beat-9.wav", "genre": "lofi", "moods": ["sad"], "bpm": 78},
        {"name": "E♭ Major Emotional Beat", "file": "beat-10.wav", "genre": "hip-hop", "moods": ["happy"], "bpm": 107},
        {"name": "C Minor Emotional Beat 2", "file": "beat-11.wav", "genre": "drill", "moods": ["dark"], "bpm": 142},
        {"name": "D Major Emotional Beat", "file": "beat-12.wav", "genre": "hip-hop", "moods": ["chill"], "bpm": 81},
        {"name": "C♯ Minor Emotional Beat 3", "file": "beat-13.wav", "genre": "lofi", "moods": ["happy"], "bpm": 75},
        {"name": "A♯ Minor Emotional Beat", "file": "beat-14.wav", "genre": "trap", "moods": ["dark"], "bpm": 73},
        {"name": "G♯ Minor Emotional Beat", "file": "beat-15.wav", "genre": "trap", "moods": ["dark"], "bpm": 119},
        {"name": "D♯ Minor Emotional Beat 2", "file": "beat-16.wav", "genre": "trap", "moods": ["sad"], "bpm": 82},
        {"name": "A♯ Minor Emotional Beat 2", "file": "beat-17.wav", "genre": "trap", "moods": ["dark"], "bpm": 107},
        {"name": "C Minor Emotional Beat 3", "file": "beat-18.wav", "genre": "drill", "moods": ["dark"], "bpm": 77},
        {"name": "D Minor Emotional Beat 2", "file": "beat-19.wav", "genre": "hip-hop", "moods": ["dark"], "bpm": 128},
        {"name": "D Minor Emotional Beat 3", "file": "beat-20.wav", "genre": "trap", "moods": ["dark"], "bpm": 70},
        {"name": "C Minor Emotional Beat 4", "file": "beat-21.wav", "genre": "drill", "moods": ["dark"], "bpm": 74},
        {"name": "F Minor Emotional Beat", "file": "beat-22.wav", "genre": "trap", "moods": ["happy"], "bpm": 100},
        {"name": "C♯ Minor Emotional Beat 4", "file": "beat-23.wav", "genre": "trap", "moods": ["dark"], "bpm": 107},
        
        ]




    
    beats_data_names = [b["name"] for b in beats_data]

    if beat_name not in beats_data_names:
        return jsonify({"success": False, "message": "Beat not allowed."}), 400


    beat = Beat.query.filter_by(name=beat_name).first()
    if not beat:
        return jsonify({"success": False, "message": "Beat not found in DB."}), 400


    existing = Favorite.query.filter_by(user_id=1, beat_id=beat.id).first()
    if existing:
        return jsonify({"success": False, "message": "Already in favorites."}), 400


    fav = Favorite(user_id=1, beat_id=beat.id)
    db.session.add(fav)
    db.session.commit()

    beat_obj = {
        "id": beat.id,
        "name": beat.name,
        "bpm": beat.bpm,
        "genre": beat.genre,
        "mood": beat.moods,
        "file": f"/beats/{beat.filename}",
        "favorite": True
    }

    return jsonify({"success": True, "beat": beat_obj})









@app.route('/api/remove-favorite', methods=['POST'])
def api_remove_favorite():
    data = request.get_json()
    beat_name = data.get("name")
    beat = Beat.query.filter_by(name=beat_name).first()
    if not beat:
        return jsonify({"success": False, "message": "Beat not found."})
    
    fav = Favorite.query.filter_by(user_id=1, beat_id=beat.id).first()
    if not fav:
        return jsonify({"success": False, "message": "Favorite not found."})
    
    db.session.delete(fav)
    db.session.commit()

    
    favorite_records = Favorite.query.filter_by(user_id=1).all()
    favorite_names = [Beat.query.get(f.beat_id).name for f in favorite_records]

    return jsonify({"success": True, "favoriteBeats": favorite_names})








# ===== ADD BEAT =====
@app.route('/api/beats', methods=['POST'])
def api_add_beat():
    data = request.get_json()
    name = data.get('name')
    bpm = data.get('bpm')
    genre = data.get('genre')
    moods = data.get('moods')
    filename = data.get('file')

    b = Beat(
        name=name,
        bpm=bpm,
        genre=genre,
        moods=",".join(moods) if isinstance(moods, list) else moods,
        filename=filename
    )
    db.session.add(b)
    db.session.commit()
    return jsonify({'status':'ok','id': b.id}), 201





# ===== ROUTES =====
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/favorites")
def favorites():
    return render_template("favorites.html")

@app.route("/beats/<path:filename>")
def serve_beat(filename):
    beat_folder = os.path.join(app.root_path, "static", "beats")
    return send_from_directory(beat_folder, filename)

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        seed_beats()
    app.run(debug=True, host="127.0.0.1", port=5000)
