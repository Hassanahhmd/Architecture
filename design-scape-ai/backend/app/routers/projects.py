from datetime import datetime, timezone
from uuid import uuid4
from pydantic import BaseModel, Field, ConfigDict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..models import Project, User
from ..security import get_current_user

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])

class ProjectInput(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    product_type: str
    room: dict
    design: dict

class ProjectView(ProjectInput):
    model_config = ConfigDict(from_attributes=True)
    id: str
    created_at: datetime
    updated_at: datetime

@router.get("", response_model=list[ProjectView])
def list_projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Project).filter(Project.owner_id == user.id).order_by(Project.updated_at.desc()).all()

@router.post("", response_model=ProjectView, status_code=201)
def create_project(body: ProjectInput, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = Project(id=str(uuid4()), owner_id=user.id, name=body.name, product_type=body.product_type, room=body.room, design=body.design)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/{project_id}", response_model=ProjectView)
def get_project(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == user.id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{project_id}", response_model=ProjectView)
def update_project(project_id: str, body: ProjectInput, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == user.id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    project.name = body.name
    project.product_type = body.product_type
    project.room = body.room
    project.design = body.design
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=204)
def delete_project(project_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == user.id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
