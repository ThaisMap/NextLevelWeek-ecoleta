import  { Request, Response } from "express";
import knex from '../database/connection';

class PointsController {
    async create(request: Request, response: Response) {
        const {
            name, 
            email,
            whatsapp, 
            latitude, 
            longitude,
            city, 
            uf,
            items
        } = request.body;
    
        const trx = await knex.transaction();
        
        const point = {
            image: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
            name, 
            email,
            whatsapp, 
            latitude, 
            longitude,
            city, 
            uf};

        const insertedId = await trx('points').insert(point);
    
        const pointItems = items.map((item_id: Number) => {
            return {
                item_id, 
                point_id: insertedId[0]
            }
        });
    
        await trx('point_items').insert(pointItems);
        await trx.commit();
    
        return response.json({
            id: insertedId[0],
            ...point
        });
    }

    async show(request: Request, response: Response) {
        const { id } = request.params;
        const point = await knex('points').where('id', id).first();
        const items = await knex('items')
        .join('point_items', 'items.id', '=', 'point_items.item_id')
        .where('point_items.point_id', id)
        .select('items.title');
        const joined = {...point, items};
        if(!point){
            return response.status(400).json({message: "Point not found"});
        }

        return response.json(joined);
    }

    async index(request: Request, response: Response) {
        const{ city, uf, items} = request.query;
        const parsedItems = String(items)
                            .split(',')
                            .map(item => Number(item.trim()));
        const points = await knex('points')
            .join('point_items', 'points.id', '=', 'point_items.point_id')
            .whereIn('point_items.item_id', parsedItems)
            .where('city', String(city))
            .where('uf', String(uf))
            .distinct()
            .select('points.*');

        return response.json(points);
    }
}

export default PointsController;