from app.extensions import ma
from app.models.testimonial import Testimonial


class TestimonialSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Testimonial
        load_instance = True
        include_fk = True
