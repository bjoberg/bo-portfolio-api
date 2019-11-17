import { Request, Response, NextFunction } from 'express';
import { Model } from 'sequelize';

import SequelizeController from "./sequelize.controller";
import ApiError from '../utils/models/api-error';
import EntityList from '../utils/models/enity-list';

export default class ImageController extends SequelizeController {
  private groupModel: Model;

  /**
   * Construct a new image controller
   * 
   * @param model image model definition
   * @param groupModel group model definition
   */
  constructor(model: Model, groupModel: Model) {
    super(model);
    this.groupModel = groupModel;
  }

  /**
   * Get all images in a specific group
   * 
   * @param req Express Request object
   * @param res Express Response object
   * @param next Express Next function
   */
  public async listAllForGroup(req: Request, res: Response, next: NextFunction) {
    try {
      req = this.sequelizeHelpers.setPage(req);
      req = this.sequelizeHelpers.setLimit(req);

      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      const groupId = req.params.id;

      // @ts-ignore
      const data = await this.model.listAllForGroup(req.query, groupId, this.groupModel);

      const entityList: EntityList = {
        limit,
        page,
        totalItems: data.count,
        pageCount: data.rows.length,
        rows: data.rows
      };

      res.json(entityList);
    } catch (error) {
      next(error as ApiError);
    }
  }

}