// - timestamps agrega createdAt y updatedAt
// - al convertir a JSON se muestra "id" en vez de "_id" y se saca "__v"
export const opcionesSchema = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
};
