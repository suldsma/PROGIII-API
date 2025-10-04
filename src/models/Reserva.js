import { query } from '../config/database.js';

class Reserva {
    constructor(data) {
        this.reserva_id = data-this.reserva_id;
        this.cliente_id = data.cliente_id;
        this.salon_id = data.salon_id;
        this.fecha = data.fecha;
        this.hora_inicio = data.hora_inicio;
        this.hora_fin = data.hora_fin;
        this.estado = data.estado;
        this.servicios_ids = data.servicios_ids;
        this.fecha_creacion = data.fecha_creacion;
        this.fecha_actualizacion = data.fecha_actualizacion;
    }

    toJSON() {
        return {
            id: this.reserva_id,
            clienteId: this.cliente_id,
            salonId: this.salon_id,
            fecha: this.fecha,
            horaInicio: this.hora_inicio,
            horaFin: this.hora_fin,
            estado: this.estado,
            servicios: this.servicios_ids,
            creado: this.fecha_creacion,
        };
    }

    async cancel(userId, roleId) {
        if(this.estado === 'CANCELADA' || this.estado === 'COMPLETADA'){
            throw new Error(`No se puedencancelar una reserva en estado ${this.estado}.`);
        }
        
        const result = await query(
            'UPDATE reservas SET estado = ?, fecha_actualizacion = CURRENT_TIMESTAMP() WHERE reserva_id = ?',
            ['CANCELADA', this.reserva_id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Error al actualizar la reserva. Podria no existir.');   
        }

        this.estado = 'CANCELADA';
        return this;
    }    
}

const ReservaModel = {
    async create(data) {
        const { cliente_id, salon_id, fecha, hora_inicio, hora_fin, servicios_ids, estado } = data;
        
        const serviciosJson = JSON.stringify(servicios_ids || []);
        
        const sql = `
            INSERT INTO reservas (cliente_id, salon_id, fecha, hora_inicio, hora_fin, servicios_ids, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await query(sql, [
            cliente_id,
            salon_id,
            fecha,
            hora_inicio,
            hora_fin || null,
            serviciosJson,
            estado
        ]);

        return new Reserva({
            reserva_id: result.insertId,
            ...data
        });
    },

    async findById(id) {
        const sql = 'SELECT * FROM reservas WHERE reserva_id = ?';
        const [row] = await query(sql, [id]);
        
        if (!row) return null;
        row.servicios_ids = JSON.parse(row.servicios_ids);
        
        return new Reserva(row);
    },

    async findAllByClienteId(clienteId) {
        const sql = 'SELECT * FROM reservas WHERE cliente_id = ? ORDER BY fecha DESC';
        const rows = await query(sql, [clienteId]);
        
        return rows.map(row => {
            row.servicios_ids = JSON.parse(row.servicios_ids);
            return new Reserva(row);
        });
    },
    
    async findAll({ page = 1, limit = 10, filters = {} }) {
        const offset = (page - 1) * limit;
        let whereClauses = [];
        let params = [];

        if (filters.estado) {
            whereClauses.push('estado = ?');
            params.push(filters.estado);
        }

        const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        const [totalRow] = await query(`SELECT COUNT(*) as total FROM reservas ${whereSql}`, params);
        const total = totalRow.total;

        const sql = `SELECT * FROM reservas ${whereSql} ORDER BY fecha DESC LIMIT ? OFFSET ?`;
        const dataRows = await query(sql, [...params, limit, offset]);

        const data = dataRows.map(row => {
            row.servicios_ids = JSON.parse(row.servicios_ids);
            return new Reserva(row);
        });

        return { data, total };
    }
};

export default ReservaModel;
    

    