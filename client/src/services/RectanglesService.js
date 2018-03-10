import api from '@/services/api';

export default {
  fetchRectangles() {
    return api().get('rectangles');
  },
  addNewRectangle(params) {
    return api().post('add_rectangle', params);
  },
  updateRectangle(params) {
    return api().put(`rectangles/${params.id}`, params);
  },
  deleteRectangle(id) {
    return api().delete(`rectangles/${id}`);
  }
}
