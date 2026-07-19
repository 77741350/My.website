import os
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# استخدم PostgreSQL عند توفر DATABASE_URL، وإلا SQLite محلياً
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
else:
    db_path = os.path.join(os.path.dirname(__file__), 'store.db')
    SQLALCHEMY_DATABASE_URI = 'sqlite:///' + db_path

db = SQLAlchemy()
db.engine_config = {'sqlite': SQLALCHEMY_DATABASE_URI}


def init_app(app):
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(40))
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='customer')
    created_at = db.Column(db.String(40), nullable=False)


class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(40), nullable=False)
    price = db.Column(db.Float, nullable=False)
    old_price = db.Column(db.Float)
    icon = db.Column(db.String(60), default='fas fa-box')
    badge = db.Column(db.String(20))
    rating = db.Column(db.Float, default=5)
    rating_count = db.Column(db.Integer, default=0)
    description = db.Column(db.Text)
    created_at = db.Column(db.String(40), nullable=False)


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    customer_name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(40), nullable=False)
    address = db.Column(db.Text)
    items = db.Column(db.Text, nullable=False)
    total = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')
    created_at = db.Column(db.String(40), nullable=False)


def seed():
    if User.query.filter_by(role='admin').count() == 0:
        now = datetime.now().isoformat()
        db.session.add(User(name='Admin', email='admin@pmstore.com',
                            phone='780402502', password='admin123',
                            role='admin', created_at=now))
        db.session.commit()

    if Product.query.count() == 0:
        now = datetime.now().isoformat()
        rows = [
            ('iPhone 15 Pro Max', 'phones', 1199, 1400, 'fas fa-mobile-screen-button', 'sale', 5, 128, 'أحدث هاتف من أبل بشاشة 6.7 بوصة وكاميرا احترافية.'),
            ('Samsung Galaxy S24 Ultra', 'phones', 1099, None, 'fas fa-mobile-screen-button', 'new', 4.5, 95, 'هاتف سامسونج الرائد بقلم S ومعالج قوي.'),
            ('MacBook Pro M3', 'laptops', 1999, 2500, 'fas fa-laptop', 'sale', 5, 76, 'لابتوب احترافي بمعالج M3 الأقوى للأداء.'),
            ('AirPods Pro 2', 'audio', 249, None, 'fas fa-headphones', None, 5, 210, 'سماعات لاسلكية بإلغاء الضوضاء النشط.'),
            ('مجموعة العناية بالبشرة', 'beauty', 89, 100, 'fas fa-spa', 'sale', 4.5, 64, 'مجموعة متكاملة للعناية بالبشرة.'),
            ('شاحن لاسلكي سريع', 'accessories', 35, None, 'fas fa-plug', None, 4, 42, 'شاحن لاسلكي سريع متوافق مع معظم الأجهزة.'),
        ]
        for r in rows:
            db.session.add(Product(name=r[0], category=r[1], price=r[2], old_price=r[3],
                                  icon=r[4], badge=r[5], rating=r[6], rating_count=r[7],
                                  description=r[8], created_at=now))
        db.session.commit()
