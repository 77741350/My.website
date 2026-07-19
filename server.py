import os
import json
from functools import wraps
from datetime import datetime

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import db
from db import db as database, User, Product, Order, init_app, seed

app = Flask(__name__, static_folder='public')
CORS(app)
init_app(app)

with app.app_context():
    database.create_all()
    seed()


# ---------- Helpers ----------
def auth_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'غير مصرح'}), 401
        user = User.query.filter_by(email=token).first()
        if not user:
            return jsonify({'error': 'جلسة غير صالحة'}), 401
        request.user = user
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return jsonify({'error': 'غير مصرح'}), 401
        user = User.query.filter_by(email=token).first()
        if not user or user.role != 'admin':
            return jsonify({'error': 'صلاحية الأدمن مطلوبة'}), 403
        request.user = user
        return f(*args, **kwargs)
    return decorated


# ---------- Auth ----------
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')
    if not all([name, email, password]):
        return jsonify({'error': 'الحقول المطلوبة ناقصة'}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'البريد مسجل مسبقاً'}), 409
    now = datetime.now().isoformat()
    database.session.add(User(name=name, email=email, phone=phone,
                              password=password, role='customer', created_at=now))
    database.session.commit()
    return jsonify({'message': 'تم التسجيل بنجاح', 'token': email}), 201


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email'),
                                password=data.get('password')).first()
    if not user:
        return jsonify({'error': 'بيانات الدخول غير صحيحة'}), 401
    return jsonify({
        'token': user.email,
        'user': {'id': user.id, 'name': user.name, 'email': user.email, 'role': user.role}
    })


@app.route('/api/auth/me', methods=['GET'])
@auth_required
def me():
    return jsonify({'user': {'id': request.user.id, 'name': request.user.name,
                            'email': request.user.email, 'role': request.user.role}})


# ---------- Products ----------
@app.route('/api/products', methods=['GET'])
def get_products():
    rows = Product.query.order_by(Product.created_at.desc()).all()
    return jsonify([product_to_dict(p) for p in rows])


@app.route('/api/products', methods=['POST'])
@admin_required
def add_product():
    data = request.get_json()
    if not all([data.get('name'), data.get('category'), data.get('price') is not None]):
        return jsonify({'error': 'الحقول المطلوبة ناقصة'}), 400
    now = datetime.now().isoformat()
    database.session.add(Product(
        name=data['name'], category=data['category'], price=data['price'],
        old_price=data.get('old_price'), icon=data.get('icon', 'fas fa-box'),
        badge=data.get('badge'), rating=data.get('rating', 5),
        rating_count=data.get('rating_count', 0),
        description=data.get('description', ''), created_at=now))
    database.session.commit()
    return jsonify({'message': 'تمت الإضافة'}), 201


@app.route('/api/products/<int:pid>', methods=['PUT'])
@admin_required
def update_product(pid):
    p = Product.query.get(pid)
    if not p:
        return jsonify({'error': 'المنتج غير موجود'}), 404
    data = request.get_json()
    for field in ['name', 'category', 'price', 'old_price', 'icon', 'badge', 'rating', 'rating_count', 'description']:
        if field in data:
            setattr(p, field, data[field])
    database.session.commit()
    return jsonify({'message': 'تم التحديث'})


@app.route('/api/products/<int:pid>', methods=['DELETE'])
@admin_required
def delete_product(pid):
    p = Product.query.get(pid)
    if not p:
        return jsonify({'error': 'المنتج غير موجود'}), 404
    database.session.delete(p)
    database.session.commit()
    return jsonify({'message': 'تم الحذف'})


# ---------- Orders ----------
@app.route('/api/orders', methods=['POST'])
@auth_required
def create_order():
    data = request.get_json()
    items = data.get('items')
    total = data.get('total')
    if not items or total is None:
        return jsonify({'error': 'بيانات الطلب ناقصة'}), 400
    now = datetime.now().isoformat()
    database.session.add(Order(
        user_id=request.user.id,
        customer_name=data.get('customer_name') or request.user.name,
        phone=data.get('phone') or request.user.phone or '',
        address=data.get('address', ''),
        items=json.dumps(items), total=total, status='pending', created_at=now))
    database.session.commit()
    return jsonify({'message': 'تم إنشاء الطلب'}), 201


@app.route('/api/orders', methods=['GET'])
@admin_required
def list_orders():
    rows = Order.query.order_by(Order.created_at.desc()).all()
    return jsonify([order_to_dict(o) for o in rows])


@app.route('/api/orders/user', methods=['GET'])
@auth_required
def user_orders():
    rows = Order.query.filter_by(user_id=request.user.id).order_by(Order.created_at.desc()).all()
    return jsonify([order_to_dict(o) for o in rows])


@app.route('/api/orders/<int:oid>', methods=['PUT'])
@admin_required
def update_order(oid):
    o = Order.query.get(oid)
    if not o:
        return jsonify({'error': 'الطلب غير موجود'}), 404
    data = request.get_json()
    if 'status' in data:
        o.status = data['status']
    database.session.commit()
    return jsonify({'message': 'تم تحديث حالة الطلب'})


# ---------- Serializers ----------
def product_to_dict(p):
    return {'id': p.id, 'name': p.name, 'category': p.category, 'price': p.price,
            'old_price': p.old_price, 'icon': p.icon, 'badge': p.badge,
            'rating': p.rating, 'rating_count': p.rating_count, 'description': p.description,
            'created_at': p.created_at}


def order_to_dict(o):
    return {'id': o.id, 'user_id': o.user_id, 'customer_name': o.customer_name,
            'phone': o.phone, 'address': o.address, 'items': o.items, 'total': o.total,
            'status': o.status, 'created_at': o.created_at}


# ---------- Static ----------
@app.route('/')
def index():
    return send_from_directory('public', 'index.html')


@app.route('/admin')
def admin_page():
    return send_from_directory('public', 'admin.html')


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('public', path)


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
