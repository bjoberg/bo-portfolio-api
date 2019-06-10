import { Router } from 'express';
import SequelizeController from '../controllers/sequelize.controller';
import { Model } from 'sequelize';

const group = require('../database/models').group;
const groupRouter = Router();
const controller = new SequelizeController(group as Model);

groupRouter.route('/groups')
/**
 * @swagger
 * /groups:
 *  get:
 *    tags:
 *      - Groups
 *    description: Gets all groups based on query
 *    parameters:
 *      - $ref: '#/components/parameters/limit'
 *      - $ref: '#/components/parameters/page'
 *      - $ref: '#/components/parameters/thumbnailUrl'
 *      - $ref: '#/components/parameters/imageUrl'
 *      - $ref: '#/components/parameters/title'
 *      - $ref: '#/components/parameters/description'
 *    responses:
 *      '200':
 *        description: A JSON array of groups
 *        schema: 
 *           $ref: '#/definitions/group'
 */
.get(controller.list);

groupRouter.route('/group/:id')
/**
 * @swagger
 * /group/{id}:
 *  get:
 *    tags:
 *      - Groups
 *    description: Find group by id
 *    parameters:
 *      - in: path
 *        name: id
 *        description: id of the group to return
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      '200':
 *        description: Group item as JSON
 *        schema: 
 *           $ref: '#/definitions/group'
 *      '404':
 *        description: Group deleted or does not exist
 *        schema: 
 *           $ref: '#/definitions/group'
 */
.get(controller.get);

export default groupRouter;