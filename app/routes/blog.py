from datetime import datetime

from flask import Blueprint, render_template, abort, request

from app.extensions import db
from app.models.blog import BlogPost
from app.models.tag import Tag

blog_bp = Blueprint('blog', __name__, url_prefix='/blog')


def _published_query():
    """Base query for published posts (respects publish_at schedule)."""
    now = datetime.utcnow()
    return BlogPost.query.filter(
        BlogPost.is_published == True,
        db.or_(BlogPost.publish_at.is_(None), BlogPost.publish_at <= now),
    )


@blog_bp.route('/')
def blog_list():
    page = request.args.get('page', 1, type=int)
    tag_slug = request.args.get('tag', '').strip()

    query = _published_query()

    active_tag = None
    if tag_slug:
        active_tag = Tag.query.filter_by(slug=tag_slug).first()
        if active_tag:
            query = query.filter(BlogPost.tags.any(Tag.id == active_tag.id))

    posts = query.order_by(BlogPost.created_at.desc()) \
        .paginate(page=page, per_page=9, error_out=False)

    all_tags = Tag.query.order_by(Tag.name).all()

    return render_template('blog/list.html', posts=posts, tags=all_tags, active_tag=active_tag)


@blog_bp.route('/<slug>')
def blog_detail(slug):
    now = datetime.utcnow()
    post = BlogPost.query.filter(
        BlogPost.slug == slug,
        BlogPost.is_published == True,
        db.or_(BlogPost.publish_at.is_(None), BlogPost.publish_at <= now),
    ).first()
    if post is None:
        abort(404)
    return render_template('blog/detail.html', post=post)
