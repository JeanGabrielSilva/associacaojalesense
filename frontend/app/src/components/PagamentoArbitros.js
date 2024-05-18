import React, { useState, useEffect } from 'react';
import axios from 'axios';
import usePagamentoArbitros from '../hooks/pagamento-arbitros/usePagamentoArbitros';
import Modal from './components-pagarbitros/Modal';
import { useNavigate } from 'react-router-dom';
import CreatePagamentoForm from './components-pagarbitros/CreatePagamentoForm';
import EditPagamentoForm from './components-pagarbitros/EditPagamentoForm';
import ConfirmDeleteModal from './components-pagarbitros/ConfirmDeleteModal';
import DropDownComponent from './DropDownComponent';
import Logout from './Logout';

function PagamentoArbitros() {
const { editPagamento, deletePagamento } = usePagamentoArbitros();
const [error, setError] = useState('');
const [pagamentosPage, setPagamentosPage] = useState(1);
const [pagamentos, setPagamentos] = useState([]); 
const [arbitros, setArbitros] = useState([]); 
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const limit = 10;
const navigate = useNavigate();
const [showCreateModal, setShowCreateModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [currentPagamento, setCurrentPagamento] = useState(null);   

const fetchPagamentos = async (page = 1) => {
  try {
    const token = localStorage.getItem('token'); 
    const response = await fetch(`http://localhost:8080/pagamento-arbitro?page=${page}`, {
        headers: {
            'Authorization': `Bearer ${token}` 
        }
    });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPagamentos(data.pagamentos);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
  } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
      setError(error.message);
  }
};

useEffect(() => {
  fetchPagamentos(currentPage);
  fetchArbitros();
}, [currentPage]);

const handlePageChange = (event) => {
  setCurrentPage(Number(event.target.value));
};

const fetchArbitros = async () => {
  try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/arbitros/all', {
          headers: { Authorization: `Bearer ${token}` }
      });
      setArbitros(response.data);
  } catch (error) {
      console.error("Erro ao buscar árbitros:", error);
      setError(error.message);
  }
};

const handleCreateSubmit = async (formData) => {
  try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:8080/pagamento-arbitro', formData, {
          headers: { Authorization: `Bearer ${token}` }
      });
      const novoPagamento = response.data;

      // Buscar o pagamento recém-criado com o árbitro incluído
      const pagamentoAtualizadoResponse = await axios.get(`http://localhost:8080/pagamento-arbitro/${novoPagamento.id}`, {
          headers: { Authorization: `Bearer ${token}` }
      });
      const pagamentoAtualizado = pagamentoAtualizadoResponse.data;

      setPagamentos([...pagamentos, pagamentoAtualizado]);
      setShowCreateModal(false);
  } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      setError('Erro ao criar pagamento');
  }
};

    const handleEditSubmit = async (formData) => {
        try {
          const token = localStorage.getItem('token');
          await axios.put(`http://localhost:8080/pagamento-arbitro/${currentPagamento.id}`, formData, {
              headers: { Authorization: `Bearer ${token}` }
          });
            const pagamentoAtualizadoResponse = await axios.get(`http://localhost:8080/pagamento-arbitro/${currentPagamento.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const pagamentoAtualizado = pagamentoAtualizadoResponse.data;
            setPagamentos(pagamentos.map(p => (p.id === currentPagamento.id ? pagamentoAtualizado : p)));
            setShowEditModal(false);
            setCurrentPagamento(null);
        } catch (error) {
            console.error('Erro ao editar pagamento:', error);
            setError('Erro ao editar pagamento');
        }
    };

    const handleEdit = (pagamento) => {
        setCurrentPagamento(pagamento);
        setShowEditModal(true);
    };

    const handleDelete = (pagamento) => {
        setCurrentPagamento(pagamento);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await deletePagamento(currentPagamento.id);
            // Atualizar localmente a lista de pagamentos removendo o item deletado
            setPagamentos(pagamentos.filter(p => p.id !== currentPagamento.id));
            setShowDeleteModal(false);
            setCurrentPagamento(null);
        } catch (error) {
            console.error('Erro ao deletar pagamento:', error);
            setError('Erro ao deletar pagamento');
        }
    };

    return (
        <div className="container">
            <div className="sidebar">
                <h2>Menu</h2>
                <ul>
                    <li><a href="/postagens">Postagens</a></li>
                    <li><a href="/arbitros">Árbitros</a></li>
                    <li><a href="/contratantes">Contratantes</a></li>
                    <li><a href="/campeonatos">Campeonatos</a></li>
                    <DropDownComponent />
                    <Logout />
                </ul>
            </div>
            <div className="main-table">
                <h2>Pagamentos dos Árbitros</h2>
                <button className="btn-open-modal" onClick={() => setShowCreateModal(true)}>Adicionar Pagamento</button>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Árbitro</th>
                            <th>Valor</th>
                            <th>Pago</th>
                            <th>Operações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagamentos.map((pagamento) => (
                            <tr key={pagamento.id}>
                                <td>{pagamento.id}</td>
                                <td>{pagamento.arbitro?.nome || 'Desconhecido'}</td>
                                <td>{pagamento.valor}</td>
                                <td>{pagamento.pago ? 'Sim' : 'Não'}</td>
                                <td>
                                    <button className="btn-edit" onClick={() => handleEdit(pagamento)}>✏️</button>
                                    <button className="btn-delete" onClick={() => handleDelete(pagamento)}>🗑️</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="pagination">
                    <select value={currentPage} onChange={handlePageChange}>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <option key={index + 1} value={index + 1}>
                                Página {index + 1}
                            </option>
                        ))}
                    </select>
                </div>
                {showCreateModal && (
                    <Modal onClose={() => setShowCreateModal(false)}>
                        <CreatePagamentoForm arbitros={arbitros} onSubmit={handleCreateSubmit} />
                    </Modal>
                )}
                {showEditModal && (
                    <Modal onClose={() => setShowEditModal(false)}>
                        <EditPagamentoForm pagamento={currentPagamento} arbitros={arbitros} onSubmit={handleEditSubmit} />
                    </Modal>
                )}
                {showDeleteModal && (
                    <Modal onClose={() => setShowDeleteModal(false)}>
                        <ConfirmDeleteModal pagamento={currentPagamento} onConfirm={confirmDelete} onCancel={() => setShowDeleteModal(false)} />
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default PagamentoArbitros;
