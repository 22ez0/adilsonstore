import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { useProduct } from "@/hooks/use-products";
import { useCreateOrder } from "@/hooks/use-orders";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle2, Camera, Upload, Check } from "lucide-react";
import { isValidCPF, formatCPF } from "@/utils/cpf";
import { useToast } from "@/hooks/use-toast";
import { type InsertOrder } from "@shared/schema";

interface CEPData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function CheckoutNew() {
  const params = useParams<{ productId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: product, isLoading: isLoadingProduct } = useProduct(Number(params.productId));
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const [step, setStep] = useState(1); // 1=installments, 2=personal, 3=docs, 4=payment, 5=success
  const [installments, setInstallments] = useState(1);
  const [cepLoading, setCepLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    phone: "",
    whatsapp: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    documentType: "cnh", // cnh, rg, passport
  });

  const [docs, setDocs] = useState({
    frontPhoto: null as string | null,
    backPhoto: null as string | null,
    selfiePhoto: null as string | null,
  });

  const [paymentProof, setPaymentProof] = useState(null as string | null);
  const [verifying, setVerifying] = useState(false);
  const [paidConfirmed, setPaidConfirmed] = useState(false);

  if (isLoadingProduct) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }
  if (!product) return <div>Produto não encontrado</div>;

  const finalPrice = Math.floor(product.price * 0.49); // 51% desconto
  const installmentValue = finalPrice / installments;
  const formattedTotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice / 100);
  const formattedInstallment = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(installmentValue / 100);

  const handleCEPLookup = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`/api/cep/${cleanCep}`);
        const data: CEPData = await response.json();
        if (response.ok) {
          setFormData(prev => ({ ...prev, address: data.street, neighborhood: data.neighborhood, city: data.city, state: data.state }));
          toast({ title: "CEP encontrado!" });
        } else {
          toast({ title: "CEP não encontrado", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Erro ao buscar CEP", variant: "destructive" });
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handlePhotoCapture = async (field: keyof typeof docs) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          setDocs(prev => ({ ...prev, [field]: event.target.result }));
          toast({ title: "Foto capturada com sucesso!" });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleVerifyDocuments = async () => {
    if (!docs.frontPhoto || !docs.backPhoto || !docs.selfiePhoto) {
      toast({ title: "Envie todas as 3 fotos", variant: "destructive" });
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('/api/documents/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpf: formData.cpf.replace(/\D/g, ''),
          name: formData.name,
          documentType: formData.documentType,
          frontPhoto: docs.frontPhoto,
          backPhoto: docs.backPhoto,
          selfiePhoto: docs.selfiePhoto,
        })
      });

      if (response.ok) {
        toast({ title: "Documentos verificados com sucesso!" });
        setStep(4);
      } else {
        toast({ title: "Erro na verificação", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Erro ao enviar documentos", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  const handlePaymentProof = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          setPaymentProof(event.target.result);
          toast({ title: "Comprovante enviado!" });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleCreateOrder = () => {
    if (!paymentProof || !paidConfirmed) {
      toast({ title: "Envie comprovante e confirme pagamento", variant: "destructive" });
      return;
    }

    const orderData: InsertOrder = {
      productId: product.id,
      customerName: formData.name,
      customerCpf: formData.cpf.replace(/\D/g, ''),
      customerPhone: formData.phone.replace(/\D/g, ''),
      customerWhatsapp: formData.whatsapp.replace(/\D/g, '') || formData.phone.replace(/\D/g, ''),
      address: `${formData.address}, ${formData.number}${formData.complement ? ' - ' + formData.complement : ''} - ${formData.neighborhood}, ${formData.city}/${formData.state}`,
      installments: installments,
      totalAmount: finalPrice,
    };

    createOrder(orderData, {
      onSuccess: () => setStep(5),
      onError: (err) => toast({ title: "Erro no pedido", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`h-2 flex-1 rounded-full transition-all ${step >= s ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-slate-700'}`} />
          ))}
        </div>

        <Card className="border-0 shadow-2xl overflow-hidden bg-slate-800">
          <CardHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6">
            <CardTitle className="text-2xl">{product.name}</CardTitle>
            <p className="text-blue-100 mt-2">{formattedTotal} • {installments}x {formattedInstallment}</p>
          </CardHeader>

          <CardContent className="p-8 text-white">
            {/* STEP 1: Installments */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Escolha como parcelar
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {[1,2,3,4,5].map(x => {
                    const value = installmentValue / 100;
                    return (
                      <button
                        key={x}
                        onClick={() => setInstallments(x)}
                        className={`p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                          installments === x
                            ? 'border-purple-500 bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg'
                            : 'border-slate-600 bg-slate-700 hover:border-purple-500'
                        }`}
                      >
                        <div className="font-bold text-lg">{x}x</div>
                        <div className="text-sm text-gray-300">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-slate-700/50 border border-purple-500/30 rounded-lg p-6">
                  <p className="text-sm text-gray-300 mb-2">💰 TOTAL: <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">{formattedTotal}</span></p>
                  <p className="text-xs text-gray-400 mt-2">📦 Entrega em até 2 horas após primeiro pagamento</p>
                </div>

                <Button onClick={() => setStep(2)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 text-lg font-bold">
                  Continuar para Dados Pessoais →
                </Button>
              </div>
            )}

            {/* STEP 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Seus Dados Pessoais
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-bold text-gray-300 mb-2 block">Nome Completo</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="João da Silva"
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-bold text-gray-300 mb-2 block">CPF</Label>
                      <Input
                        value={formatCPF(formData.cpf)}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                        className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-bold text-gray-300 mb-2 block">Data Nascimento</Label>
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-gray-300 mb-2 block">Telefone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                      placeholder="(11) 9999-9999"
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-500 w-full text-base"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-bold text-gray-300 mb-2 block">WhatsApp (opcional)</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
                      placeholder="(11) 9999-9999"
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-500 w-full text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-gray-300 mb-2 block">CEP</Label>
                    <Input
                      value={formData.cep}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormData({ ...formData, cep: v });
                        if (v.length === 8) handleCEPLookup(v);
                      }}
                      placeholder="Somente números"
                      className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                      disabled={cepLoading}
                    />
                  </div>

                  {formData.address && (
                    <>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-bold text-gray-300 mb-2 block">Rua</Label>
                          <Input value={formData.address} disabled className="bg-slate-600 border-slate-500 text-gray-300" />
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-gray-300 mb-2 block">Número</Label>
                          <Input
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            placeholder="123"
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-bold text-gray-300 mb-2 block">Complemento</Label>
                          <Input
                            value={formData.complement}
                            onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                            placeholder="Apt 101"
                            className="bg-slate-700 border-slate-600 text-white placeholder-gray-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <Input value={formData.neighborhood} disabled className="bg-slate-600 border-slate-500 text-gray-300" placeholder="Bairro" />
                        <Input value={formData.city} disabled className="bg-slate-600 border-slate-500 text-gray-300" placeholder="Cidade" />
                        <Input value={formData.state} disabled className="bg-slate-600 border-slate-500 text-gray-300" placeholder="Estado" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setStep(1)} variant="outline" className="flex-1">← Voltar</Button>
                  <Button onClick={() => setStep(3)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Continuar para Documentos →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Document Verification */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Verificação de Identidade
                </h2>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-bold text-gray-300 mb-3 block">Escolha o tipo de documento:</Label>
                    <RadioGroup value={formData.documentType} onValueChange={(v) => setFormData({ ...formData, documentType: v })}>
                      <div className="flex items-center gap-2 p-3 bg-slate-700 rounded-lg cursor-pointer">
                        <RadioGroupItem value="cnh" id="cnh" />
                        <label htmlFor="cnh" className="flex-1 cursor-pointer font-medium">CNH (Carteira de Motorista)</label>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-700 rounded-lg cursor-pointer">
                        <RadioGroupItem value="rg" id="rg" />
                        <label htmlFor="rg" className="flex-1 cursor-pointer font-medium">RG (Registro Geral)</label>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-700 rounded-lg cursor-pointer">
                        <RadioGroupItem value="passport" id="passport" />
                        <label htmlFor="passport" className="flex-1 cursor-pointer font-medium">Passaporte</label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-600">
                    <div>
                      <Label className="text-sm font-bold text-gray-300 mb-2 block">1️⃣ Foto do documento (FRENTE)</Label>
                      <button
                        onClick={() => handlePhotoCapture('frontPhoto')}
                        className={`w-full p-8 border-2 border-dashed rounded-lg transition-all ${
                          docs.frontPhoto ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-purple-500'
                        }`}
                      >
                        {docs.frontPhoto ? (
                          <div className="text-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="font-bold text-green-400">Foto capturada!</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="font-bold">Clique para enviar foto</p>
                            <p className="text-xs text-gray-500 mt-1">Tire uma foto nítida da FRENTE</p>
                          </div>
                        )}
                      </button>
                    </div>

                    <div>
                      <Label className="text-sm font-bold text-gray-300 mb-2 block">2️⃣ Foto do documento (VERSO)</Label>
                      <button
                        onClick={() => handlePhotoCapture('backPhoto')}
                        className={`w-full p-8 border-2 border-dashed rounded-lg transition-all ${
                          docs.backPhoto ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-purple-500'
                        }`}
                      >
                        {docs.backPhoto ? (
                          <div className="text-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="font-bold text-green-400">Foto capturada!</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="font-bold">Clique para enviar foto</p>
                            <p className="text-xs text-gray-500 mt-1">Tire uma foto nítida do VERSO</p>
                          </div>
                        )}
                      </button>
                    </div>

                    <div>
                      <Label className="text-sm font-bold text-gray-300 mb-2 block">3️⃣ Selfie segurando documento</Label>
                      <button
                        onClick={() => handlePhotoCapture('selfiePhoto')}
                        className={`w-full p-8 border-2 border-dashed rounded-lg transition-all ${
                          docs.selfiePhoto ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-purple-500'
                        }`}
                      >
                        {docs.selfiePhoto ? (
                          <div className="text-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                            <p className="font-bold text-green-400">Foto capturada!</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                            <p className="font-bold">Clique para enviar foto</p>
                            <p className="text-xs text-gray-500 mt-1">Tire uma selfie segurando próximo ao rosto</p>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1">← Voltar</Button>
                  <Button onClick={handleVerifyDocuments} disabled={verifying} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Verificar Documentos →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: Payment Proof */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                  Comprovante de Pagamento
                </h2>

                <div className="bg-gradient-to-br from-green-900/30 to-blue-900/30 border border-green-500/30 rounded-lg p-6">
                  <p className="text-sm text-gray-300 mb-4">Envie o comprovante do PIX ou transfer:</p>
                  <button
                    onClick={handlePaymentProof}
                    className={`w-full p-8 border-2 border-dashed rounded-lg transition-all ${
                      paymentProof ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-green-500'
                    }`}
                  >
                    {paymentProof ? (
                      <div className="text-center">
                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="font-bold text-green-400">Comprovante enviado!</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="font-bold">Clique para enviar comprovante</p>
                        <p className="text-xs text-gray-500 mt-1">PDF ou imagem do PIX/TED</p>
                      </div>
                    )}
                  </button>
                </div>

                <div className="bg-slate-700/50 border border-blue-500/30 rounded-lg p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paidConfirmed}
                      onChange={(e) => setPaidConfirmed(e.target.checked)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-300">
                      Confirmo que já realizei o pagamento de <strong>{formattedInstallment}</strong> (primeira parcela)
                    </span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => setStep(3)} variant="outline" className="flex-1">← Voltar</Button>
                  <Button 
                    onClick={handleCreateOrder} 
                    disabled={isCreatingOrder} 
                    className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    {isCreatingOrder ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Finalizar Compra →
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 5: Success */}
            {step === 5 && (
              <div className="space-y-6 text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-blue-500">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                  Compra Confirmada!
                </h2>
                <p className="text-gray-300 text-lg">
                  Seu {product.name} chegará em até <strong className="text-green-400">2 horas</strong> após o pagamento confirmado
                </p>
                <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-lg p-6">
                  <p className="text-sm text-gray-400 mb-3">Você receberá:</p>
                  <ul className="text-sm text-gray-300 space-y-2">
                    <li>✓ {product.name} original com garantia</li>
                    <li>✓ Capinha protetora premium</li>
                    <li>✓ Carregador original</li>
                    <li>✓ Nota Fiscal eletrônica</li>
                    <li>✓ Opção de reembolso em 30 dias</li>
                  </ul>
                </div>
                <Button onClick={() => setLocation("/")} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  Voltar para Início
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
