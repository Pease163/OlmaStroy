from app.extensions import ma
from app.models.project_image import ProjectImage


class ProjectImageSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = ProjectImage
        load_instance = True
        include_fk = True
