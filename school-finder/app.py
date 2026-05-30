from flask import Flask, render_template, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# SQLite Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(app.instance_path, 'edufind.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ── DATABASE MODELS ──

class School(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    area = db.Column(db.String(50), nullable=False)
    emoji = db.Column(db.String(10), nullable=False)
    color = db.Column(db.String(10), nullable=False)
    rating = db.Column(db.Float, nullable=False)
    established = db.Column(db.Integer, nullable=False)
    medium = db.Column(db.String(50), nullable=False)
    total_students = db.Column(db.Integer, nullable=False)
    address = db.Column(db.String(200), nullable=False)
    map_query = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    
    fee = db.relationship('Fee', backref='school', uselist=False, cascade="all, delete-orphan")
    teachers = db.relationship('Teacher', backref='school', lazy=True, cascade="all, delete-orphan")
    facilities = db.relationship('Facility', backref='school', lazy=True, cascade="all, delete-orphan")

class Fee(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    school_id = db.Column(db.Integer, db.ForeignKey('school.id'), nullable=False)
    admission = db.Column(db.Integer, nullable=False)
    monthly = db.Column(db.Integer, nullable=False)
    annual = db.Column(db.Integer, nullable=False)
    transport = db.Column(db.Integer, nullable=False)

class Teacher(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    school_id = db.Column(db.Integer, db.ForeignKey('school.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    exp = db.Column(db.String(50), nullable=False)
    qual = db.Column(db.String(100), nullable=False)

class Facility(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    school_id = db.Column(db.Integer, db.ForeignKey('school.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)


# ── SEED DATABASE (Initial Data) ──
def seed_db():
    """Inserts initial data into the database if it's empty."""
    if School.query.first() is None:
        data = [
            School(id=1, name="Beaconhouse School System", type="Private", city="Lahore", area="Gulberg", emoji="🏛️", color="#1A2E42", rating=4.8, established=1975, medium="English", total_students=1800, address="54 Main Gulberg Blvd, Lahore", map_query="Beaconhouse+Gulberg+Lahore", description="One of Pakistan's leading private school systems with over 4 decades of academic excellence. Known for strong CAIE results and holistic development programs.",
                   fee=Fee(admission=20000, monthly=10000, annual=8000, transport=4000),
                   teachers=[Teacher(name="Dr. Fatima Malik", subject="Mathematics", exp="15 years", qual="PhD Mathematics"), Teacher(name="Mr. Omar Siddiqui", subject="English Literature", exp="10 years", qual="MA English")],
                   facilities=[Facility(name="Science Lab"), Facility(name="Computer Lab"), Facility(name="Library"), Facility(name="Sports Ground"), Facility(name="Swimming Pool")]),
                   
            School(id=2, name="City School", type="Private", city="Lahore", area="Defence", emoji="🎓", color="#1B3A2B", rating=4.6, established=1978, medium="English", total_students=1400, address="Plot 22, Phase 5, DHA, Lahore", map_query="The+City+School+DHA+Lahore", description="A premier educational institution committed to developing confident, creative and compassionate individuals ready for a global future.",
                   fee=Fee(admission=15000, monthly=8500, annual=6000, transport=3500),
                   teachers=[Teacher(name="Ms. Hina Baig", subject="Urdu", exp="9 years", qual="MA Urdu"), Teacher(name="Mr. Kamran Yousuf", subject="Computer Science", exp="11 years", qual="BSc CS")],
                   facilities=[Facility(name="Computer Lab"), Facility(name="Library"), Facility(name="Sports Ground")]),
                   
            School(id=3, name="Aga Khan School", type="Private", city="Karachi", area="Clifton", emoji="🌟", color="#2A1A3A", rating=4.9, established=1980, medium="English", total_students=2100, address="8 Club Road, Clifton, Karachi", map_query="Aga+Khan+School+Clifton+Karachi", description="A world-class institution part of the Aga Khan Development Network, offering an internationally recognized curriculum with a deep focus on ethical leadership.",
                   fee=Fee(admission=25000, monthly=12000, annual=10000, transport=5000),
                   teachers=[Teacher(name="Dr. Sarah Qureshi", subject="History", exp="18 years", qual="PhD History"), Teacher(name="Mr. Adil Mirza", subject="Mathematics", exp="14 years", qual="MSc Applied Math")],
                   facilities=[Facility(name="Science Labs"), Facility(name="Library"), Facility(name="Swimming Pool"), Facility(name="Sports Complex")]),
                   
            School(id=4, name="Government Model High School", type="Government", city="Islamabad", area="G-9", emoji="🏫", color="#1A2A1A", rating=4.1, established=1970, medium="Urdu/English", total_students=2400, address="Street 15, G-9/1, Islamabad", map_query="Government+Model+High+School+G9+Islamabad", description="A reputable federal government school offering quality education at highly affordable fees. Strong in academics with disciplined learning environment.",
                   fee=Fee(admission=500, monthly=300, annual=1000, transport=800),
                   teachers=[Teacher(name="Mr. Iqbal Hussain", subject="Islamiat", exp="20 years", qual="MA Islamiat"), Teacher(name="Ms. Rehana Bibi", subject="Mathematics", exp="16 years", qual="BSc Mathematics")],
                   facilities=[Facility(name="Library"), Facility(name="Sports Ground"), Facility(name="Science Lab")]),
                   
            School(id=5, name="Roots International School", type="Private", city="Rawalpindi", area="Bahria Town", emoji="🌿", color="#2A1A0A", rating=4.4, established=1988, medium="English", total_students=1100, address="Bahria Town Phase 7, Rawalpindi", map_query="Roots+International+Bahria+Town+Rawalpindi", description="A progressive school with emphasis on creative thinking, critical skills, and a balanced extracurricular program alongside strong academic outcomes.",
                   fee=Fee(admission=18000, monthly=9000, annual=7000, transport=3200),
                   teachers=[Teacher(name="Ms. Amna Tariq", subject="English", exp="11 years", qual="MA TEFL"), Teacher(name="Mr. Shahid Mehmood", subject="Physics", exp="9 years", qual="MSc Physics")],
                   facilities=[Facility(name="Computer Lab"), Facility(name="Library"), Facility(name="Sports Ground")]),
                   
            School(id=6, name="Karachi Grammar School", type="Private", city="Karachi", area="Saddar", emoji="📚", color="#1A0A2A", rating=4.7, established=1847, medium="English", total_students=1600, address="Dunolly Road, Saddar, Karachi", map_query="Karachi+Grammar+School+Saddar", description="Pakistan's oldest and most prestigious school, established in 1847. KGS alumni include prominent national leaders, professionals and Nobel laureates.",
                   fee=Fee(admission=30000, monthly=14000, annual=12000, transport=5500),
                   teachers=[Teacher(name="Mr. Robert D'Souza", subject="Literature", exp="22 years", qual="MA Literature (Oxford)"), Teacher(name="Ms. Parveen Sami", subject="Mathematics", exp="17 years", qual="MSc Mathematics")],
                   facilities=[Facility(name="Historic Library"), Facility(name="Science Labs"), Facility(name="Cricket Ground"), Facility(name="Swimming Pool")])
        ]
        db.session.add_all(data)
        db.session.commit()

# ── ROUTES & APIs ──

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/schools', methods=['GET'])
def get_schools():
    schools = School.query.all()
    result = []
    for s in schools:
        school_dict = {
            'id': s.id, 'name': s.name, 'type': s.type, 'city': s.city, 'area': s.area,
            'emoji': s.emoji, 'color': s.color, 'rating': s.rating, 'established': s.established,
            'medium': s.medium, 'totalStudents': s.total_students, 'address': s.address,
            'mapQuery': s.map_query, 'description': s.description,
            'fee': {'admission': s.fee.admission, 'monthly': s.fee.monthly, 'annual': s.fee.annual, 'transport': s.fee.transport},
            'teachers': [{'name': t.name, 'subject': t.subject, 'exp': t.exp, 'qual': t.qual} for t in s.teachers],
            'facilities': [f.name for f in s.facilities]
        }
        result.append(school_dict)
    return jsonify(result)

if __name__ == '__main__':
    # Ensure instance folder exists
    os.makedirs(app.instance_path, exist_ok=True)
    
    with app.app_context():
        db.create_all()
        seed_db() # Populate DB on first run
        
    app.run(debug=True)