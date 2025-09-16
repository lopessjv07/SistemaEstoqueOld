// Variáveis globais
let currentEditId = null;
let items = [];

// Elementos DOM
const itemForm = document.getElementById('item-form');
const itemsContainer = document.getElementById('items-container');
const searchInput = document.getElementById('search-input');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const confirmModal = document.getElementById('confirm-modal');
const toast = document.getElementById('toast');
const loading = document.getElementById('loading');

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadItems();
    setupEventListeners();
});

function setupEventListeners() {
    itemForm.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', resetForm);
    searchInput.addEventListener('input', handleSearch);
    
    // Modal events
    document.getElementById('confirm-delete').addEventListener('click', confirmDelete);
    document.getElementById('cancel-delete').addEventListener('click', closeModal);
    
    // Fechar modal clicando fora
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            closeModal();
        }
    });
}

// Carregar itens da API
async function loadItems() {
    try {
        showLoading(true);
        const response = await fetch('/api/items');
        
        if (!response.ok) {
            throw new Error('Erro ao carregar itens');
        }
        
        items = await response.json();
        renderItems(items);
        showLoading(false);
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar itens', 'error');
        showLoading(false);
    }
}

// Renderizar itens na tela
function renderItems(itemsToRender) {
    if (itemsToRender.length === 0) {
        itemsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum item encontrado</h3>
                <p>Adicione o primeiro item ao seu estoque!</p>
            </div>
        `;
        return;
    }

    itemsContainer.innerHTML = itemsToRender.map(item => `
        <div class="item-card" data-id="${item.id}">
            <div class="item-header">
                <h3 class="item-name">${escapeHtml(item.name)}</h3>
                <span class="item-id">#${item.id}</span>
            </div>
            
            <div class="item-details">
                <div class="item-detail">
                    <span class="detail-label">
                        <i class="fas fa-cubes"></i> Quantidade:
                    </span>
                    <span class="detail-value quantity">${item.quantity}</span>
                </div>
                
                <div class="item-detail">
                    <span class="detail-label">
                        <i class="fas fa-dollar-sign"></i> Preço:
                    </span>
                    <span class="detail-value price">R$ ${formatPrice(item.price)}</span>
                </div>
                
                <div class="item-detail">
                    <span class="detail-label">
                        <i class="fas fa-calculator"></i> Total:
                    </span>
                    <span class="detail-value price">R$ ${formatPrice(item.quantity * item.price)}</span>
                </div>
            </div>
            
            <div class="item-actions">
                <button class="btn btn-edit" onclick="editItem(${item.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-delete" onclick="deleteItem(${item.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Manipular envio do formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(itemForm);
    const itemData = {
        name: formData.get('name').trim(),
        quantity: parseInt(formData.get('quantity')),
        price: parseFloat(formData.get('price'))
    };

    // Validação
    if (!itemData.name) {
        showToast('Nome do produto é obrigatório', 'error');
        return;
    }

    if (itemData.quantity < 0) {
        showToast('Quantidade deve ser maior ou igual a zero', 'error');
        return;
    }

    if (itemData.price < 0) {
        showToast('Preço deve ser maior ou igual a zero', 'error');
        return;
    }

    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

        let response;
        if (currentEditId) {
            // Atualizar item existente
            response = await fetch(`/api/items/${currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });
        } else {
            // Criar novo item
            response = await fetch('/api/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(itemData)
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao salvar item');
        }

        const result = await response.json();
        showToast(result.message || 'Item salvo com sucesso!');
        
        resetForm();
        loadItems();
        
    } catch (error) {
        console.error('Erro:', error);
        showToast(error.message || 'Erro ao salvar item', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Item';
    }
}

// Editar item
async function editItem(id) {
    try {
        const response = await fetch(`/api/items/${id}`);
        
        if (!response.ok) {
            throw new Error('Erro ao carregar item');
        }
        
        const item = await response.json();
        
        // Preencher formulário
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-quantity').value = item.quantity;
        document.getElementById('item-price').value = item.price;
        
        // Atualizar interface
        currentEditId = id;
        formTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Item';
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Atualizar Item';
        cancelBtn.style.display = 'inline-flex';
        
        // Scroll para o formulário
        document.querySelector('.form-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
        
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao carregar item para edição', 'error');
    }
}

// Excluir item
function deleteItem(id) {
    const item = items.find(item => item.id === id);
    if (!item) return;
    
    // Mostrar modal de confirmação
    confirmModal.style.display = 'block';
    confirmModal.dataset.deleteId = id;
}

// Confirmar exclusão
async function confirmDelete() {
    const id = confirmModal.dataset.deleteId;
    
    try {
        const response = await fetch(`/api/items/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao excluir item');
        }
        
        const result = await response.json();
        showToast(result.message || 'Item excluído com sucesso!');
        
        closeModal();
        loadItems();
        
    } catch (error) {
        console.error('Erro:', error);
        showToast(error.message || 'Erro ao excluir item', 'error');
    }
}

// Resetar formulário
function resetForm() {
    itemForm.reset();
    currentEditId = null;
    formTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar Novo Item';
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Item';
    cancelBtn.style.display = 'none';
}

// Buscar itens
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderItems(items);
        return;
    }
    
    const filteredItems = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.id.toString().includes(searchTerm)
    );
    
    renderItems(filteredItems);
}

// Fechar modal
function closeModal() {
    confirmModal.style.display = 'none';
    delete confirmModal.dataset.deleteId;
}

// Mostrar/ocultar loading
function showLoading(show) {
    if (show) {
        loading.style.display = 'block';
        itemsContainer.style.display = 'none';
    } else {
        loading.style.display = 'none';
        itemsContainer.style.display = 'grid';
    }
}

// Mostrar toast
function showToast(message, type = 'success') {
    const toastContent = toast.querySelector('.toast-content');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Configurar ícone e classe
    if (type === 'error') {
        toast.classList.add('error');
        toastIcon.className = 'toast-icon fas fa-exclamation-circle';
    } else {
        toast.classList.remove('error');
        toastIcon.className = 'toast-icon fas fa-check-circle';
    }
    
    toastMessage.textContent = message;
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Ocultar após 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utilitários
function formatPrice(price) {
    return parseFloat(price).toFixed(2).replace('.', ',');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Atalhos de teclado
document.addEventListener('keydown', (e) => {
    // ESC para fechar modal ou cancelar edição
    if (e.key === 'Escape') {
        if (confirmModal.style.display === 'block') {
            closeModal();
        } else if (currentEditId) {
            resetForm();
        }
    }
    
    // Ctrl+N para novo item
    if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        resetForm();
        document.getElementById('item-name').focus();
    }
});

