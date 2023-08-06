"use strict";

// THIS IS THE STRETCH GOAL ...
// It takes in a schema in the constructor and uses that instead of every collection
// being the same and requiring their own schema. That's not very DRY!

class DataCollection {
  constructor(model) {
    this.model = model;
  }

  get(id) {
    if (id) {
      return this.model.findOne({ where: { id: id } });
    } else {
      return this.model.findAll({});
    }
  }

  create(record) {
    return this.model.create(record);
  }

  update(id, data) {
    return this.model
      .findOne({ where: { id: id } })
      .then((record) => record.update(data));
  }

  delete(id) {
    return this.model.destroy({ where: { id } });
  }
  async getUserPosts(id, model) {
    let record = await this.model.findOne({
        where: { id },
        include: model,
    });
    return record;
}
  async getNotifications(id, model) {
    let record = await this.model.findOne({
        where: { id },
        include: model,
    });
    return record;
}
async getJobTitle(job_title,model){
  let record= await this.model.findAll({
    where:{job_title},
    include: model
  })
  return record
}
async checkJobPostId(job_id,model){
  let record= await this.model.findOne({
    where:{job_id},
    include: model
  })
  return record
}
async checkPostId(post_id,model){
  let record= await this.model.findOne({
    where:{post_id},
    include: model
  })
  return record
}
async getJobCity(job_city,model){
  let record= await this.model.findAll({
    where:{job_city},
    include: model
  })
  return record
}

async getCVbyTitle(job_title,model){
  let record= await this.model.findAll({
    where:{job_title},
    include: model
  })
  return record
}

async getCVbyfield(job_field,model){
  let record= await this.model.findAll({
    where:{job_field},
    include: model
  })
  return record
}

async getCVbyTitleAndField(job_title, job_field,model){
  let record= await this.model.findAll({
    where:{job_title,job_field},
    include: model
  })
  return record
}

async getJobApplyer(id, model) {
  let record = await this.model.findOne({
      where: { id },
      include: model,
  });
  return record;
}


}

module.exports = DataCollection;
