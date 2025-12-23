import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useProduct } from "@/hooks/use-products";
import { useCreateOrder } from "@/hooks/use-orders";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShieldCheck, CheckCircle2, ArrowRight, Phone, Clock, CheckIcon, MessageCircle } from "lucide-react";
import { isValidCPF, formatCPF } from "@/utils/cpf";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { type InsertOrder } from "@shared/schema";

// Payment plans
const PLANS = [
  { id: 1, label: "1x de", image: "/images/qrcode-500.jpeg" },
  { id: 2, label: "2x de", image: "/images/qrcode-250.jpeg" },
  { id: 3, label: "3x de", image: "/images/qrcode-166.jpeg" },
  { id: 4, label: "4x de", image: "/images/qrcode-125.jpeg" },
  { id: 5, label: "5x de", image: null },
];

interface CEPData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export default function Checkout() {
  const params = useParams<{ productId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { data: product, isLoading: isLoadingProduct } = useProduct(Number(params.productId));
  const { mutate: createOrder, isPending: isCreatingOrder } = useCreateOrder();

  const [step, setStep] = useState(1);
  const [cepLoading, setCepLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    phone: "",
    whatsapp: "",
    agreed: false,
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    plan: "1"
  });

  const handleCEPLookup = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`/api/cep/${cleanCep}`);
        const data: CEPData = await response.json();
        
        if (response.ok) {
          setFormData(prev => ({
            ...prev,
            address: data.street,
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
          }));
          toast({ title: "CEP encontrado!", description: "Preencha número e complemento." });
        } else {
          toast({ title: "CEP não encontrado", description: "Verifique e tente novamente.", variant: "destructive" });
        }
      } catch (err) {
        toast({ title: "Erro", description: "Não foi possível buscar o CEP.", variant: "destructive" });
      } finally {
        setCepLoading(false);
      }
    }
  };

  if (isLoadingProduct) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  if (!product) return <div>Produto não encontrado</div>;

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name || !isValidCPF(formData.cpf)) {
        toast({ title: "Erro", description: "CPF inválido ou nome incompleto.", variant: "destructive" });
        return;
      }
    }
    if (step === 2 && !formData.agreed) {
      toast({ title: "Atenção", description: "Você deve concordar com os termos.", variant: "destructive" });
      return;
    }
    if (step === 3 && (!formData.address || !formData.cep || !formData.number)) {
      toast({ title: "Endereço incompleto", description: "Preencha CEP, rua e número.", variant: "destructive" });
      return;
    }
    setStep(s => s + 1);
  };

  const handlePayment = () => {
    const totalAmount = product.price;
    const contactPhone = formData.whatsapp || formData.phone;
    const orderData: InsertOrder = {
      productId: product.id,
      customerName: formData.name,
      customerCpf: formData.cpf.replace(/\D/g, ''),
      customerPhone: contactPhone,
      customerWhatsapp: formData.whatsapp || formData.phone,
      address: `${formData.address}, ${formData.number}${formData.complement ? ' - ' + formData.complement : ''} - ${formData.neighborhood}, ${formData.city}/${formData.state}`,
      installments: parseInt(formData.plan),
      totalAmount: totalAmount,
    };

    createOrder(orderData, {
      onSuccess: () => setStep(6),
      onError: (err) => toast({ title: "Erro no pedido", description: err.message, variant: "destructive" }),
    });
  };

  const selectedPlan = PLANS.find(p => p.id === parseInt(formData.plan));
  const planValue = product.price / parseInt(formData.plan);
  const formattedPlanValue = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(planValue / 100);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8 flex justify-between items-center px-4">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`flex items-center ${s < 5 ? "flex-1" : ""}`}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
                }`}
              >
                {step > s ? <CheckIcon className="w-5 h-5" /> : s}
              </div>
              {s < 5 && (
                <div className={`h-1 flex-1 mx-2 rounded-full ${step > s ? "bg-blue-600" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-300" />
              Checkout Seguro
            </CardTitle>
            <CardDescription className="text-blue-100">
              {product.name} - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price / 100)}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {/* Step 1: Identification */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-slate-900">Dados Pessoais</h2>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input 
                        id="name" 
                        placeholder="Seu nome completo" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        data-testid="input-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input 
                        id="cpf" 
                        placeholder="000.000.000-00" 
                        value={formData.cpf}
                        maxLength={14}
                        onChange={e => setFormData({...formData, cpf: formatCPF(e.target.value)})}
                        data-testid="input-cpf"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (opcional)</Label>
                      <Input 
                        id="phone" 
                        placeholder="(11) 99999-9999" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        data-testid="input-phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp para contato</Label>
                      <Input 
                        id="whatsapp" 
                        placeholder="(11) 99999-9999" 
                        value={formData.whatsapp}
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                        data-testid="input-whatsapp"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                    <MessageCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Informações via WhatsApp</p>
                      <p className="text-xs text-blue-700 mt-1">Após o pagamento ser confirmado, enviaremos todas as informações do seu produto via WhatsApp</p>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleNextStep} data-testid="button-next-step-1">
                    Continuar <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Terms */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-slate-900">Termos de Responsabilidade</h2>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 leading-relaxed">
                    Declaro estar ciente que esta compra é registrada no governo e que tenho responsabilidade de pagar as parcelas nas datas acordadas, estando sujeito às penalidades legais em caso de inadimplência.
                  </div>
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={formData.agreed}
                      onCheckedChange={(c) => setFormData({...formData, agreed: c === true})}
                      data-testid="checkbox-terms"
                    />
                    <Label htmlFor="terms" className="font-medium text-sm">Li e concordo com os termos acima</Label>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleNextStep} disabled={!formData.agreed} data-testid="button-next-step-2">
                    Continuar
                  </Button>
                </motion.div>
              )}

              {/* Step 3: Address */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-slate-900">Endereço de Entrega</h2>
                  
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="00000-000" 
                        value={formData.cep}
                        maxLength={9}
                        onChange={e => setFormData({...formData, cep: e.target.value})}
                        data-testid="input-cep"
                      />
                      <Button 
                        variant="outline" 
                        onClick={() => handleCEPLookup(formData.cep)}
                        disabled={cepLoading || formData.cep.length < 8}
                        data-testid="button-search-cep"
                      >
                        {cepLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">Prazo de entrega: até 1 hora após confirmação do pagamento</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Endereço</Label>
                      <Input 
                        placeholder="Rua, Avenida..." 
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        disabled={formData.cep.length === 8}
                        data-testid="input-address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Número</Label>
                      <Input 
                        placeholder="123" 
                        value={formData.number}
                        onChange={e => setFormData({...formData, number: e.target.value})}
                        data-testid="input-number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Complemento (opcional)</Label>
                      <Input 
                        placeholder="Apto 42" 
                        value={formData.complement}
                        onChange={e => setFormData({...formData, complement: e.target.value})}
                        data-testid="input-complement"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bairro</Label>
                      <Input 
                        value={formData.neighborhood}
                        onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                        disabled={formData.cep.length === 8}
                        data-testid="input-neighborhood"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade</Label>
                      <Input 
                        value={formData.city}
                        onChange={e => setFormData({...formData, city: e.target.value})}
                        disabled={formData.cep.length === 8}
                        data-testid="input-city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Input 
                        value={formData.state}
                        onChange={e => setFormData({...formData, state: e.target.value})}
                        disabled={formData.cep.length === 8}
                        maxLength={2}
                        data-testid="input-state"
                      />
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleNextStep} data-testid="button-next-step-3">
                    Continuar
                  </Button>
                </motion.div>
              )}

              {/* Step 4: Plan Selection */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-slate-900">Escolha o Parcelamento</h2>
                  <RadioGroup value={formData.plan} onValueChange={(val) => setFormData({...formData, plan: val})}>
                    {PLANS.map((plan) => {
                      const val = product.price / plan.id;
                      const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val / 100);
                      
                      return (
                        <div key={plan.id} className="flex items-center space-x-2 border rounded-xl p-4 hover:bg-blue-50 transition-colors [&:has(:checked)]:border-blue-600 [&:has(:checked)]:bg-blue-50" data-testid={`plan-option-${plan.id}`}>
                          <RadioGroupItem value={plan.id.toString()} id={`plan-${plan.id}`} />
                          <Label htmlFor={`plan-${plan.id}`} className="flex-1 cursor-pointer font-medium">
                            {plan.label} <span className="text-blue-600 font-bold">{formatted}</span> via Pix
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleNextStep} data-testid="button-next-step-4">
                    Ir para Pagamento
                  </Button>
                </motion.div>
              )}

              {/* Step 5: Payment (QR Code) */}
              {step === 5 && <PaymentStep product={product} formData={formData} selectedPlan={selectedPlan} isCreatingOrder={isCreatingOrder} handlePayment={handlePayment} toast={toast} />}

              {/* Step 6: Success */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900">Pedido Confirmado!</h2>
                  <p className="text-slate-600 max-w-sm mx-auto">
                    Seu pedido foi recebido com sucesso!
                  </p>
                  
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 space-y-3">
                    <div className="flex justify-center">
                      <MessageCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-bold text-green-900">Mensagem via WhatsApp</p>
                    <p className="text-sm text-green-800">
                      Enviaremos todas as informações do seu produto para o WhatsApp <span className="font-bold">{formData.whatsapp || formData.phone}</span> em breve!
                    </p>
                  </div>
                  
                  <div className="pt-6 space-y-2">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700 gap-2 h-12 text-lg" 
                      onClick={() => {
                        const phone = (formData.whatsapp || formData.phone).replace(/\D/g, '');
                        window.open(`https://wa.me/55${phone}`, '_blank');
                      }}
                      data-testid="button-whatsapp-contact"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Abrir WhatsApp
                    </Button>
                    <Button variant="link" onClick={() => setLocation("/")} data-testid="button-back-home">
                      Voltar para a Loja
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
}

function PaymentStep({ product, formData, selectedPlan, isCreatingOrder, handlePayment, toast }: any) {
  const [timeLeft, setTimeLeft] = useState(3600);
  const [pixQRCode, setPixQRCode] = useState<string>("");
  const [pixCode, setPixCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(true);
  const [copied, setCopied] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");

  useEffect(() => {
    generatePixCode();
    
    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [product?.id]);

  const generatePixCode = async () => {
    try {
      const amount = product?.price || 0;
      const response = await fetch("/api/pix/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount,
          orderId: `ORD-${Date.now()}`,
          customerName: formData?.name || "Cliente",
          productId: product?.id,
        }),
      });
      const data = await response.json();
      setPixQRCode(data.qrCode);
      setPixCode(data.pixCode || data.pixKey || "adilsonstore@2mail.co");
    } catch (err) {
      toast({ title: "Erro ao gerar PIX", variant: "destructive" });
      setPixCode("adilsonstore@2mail.co");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast({ title: "Chave PIX copiada!", description: "Código pronto para colar no seu banco." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        toast({ title: "Arquivo inválido", description: "Envie uma imagem ou PDF.", variant: "destructive" });
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "Máximo 5MB.", variant: "destructive" });
        return;
      }

      setProofFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProofPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({ title: "Comprovante enviado", description: "Você pode agora confirmar o pagamento." });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      key="step5"
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
      className="space-y-6 text-center"
    >
      <h2 className="text-2xl font-bold text-slate-900">Pagamento Pix</h2>
      <p className="text-slate-600">Escaneie o QR Code abaixo ou copie o código para pagar.</p>
      
      <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-blue-300 inline-block mx-auto mb-6">
        {isGenerating ? (
          <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm">Gerando QRCode PIX...</p>
          </div>
        ) : pixQRCode ? (
          <img src={pixQRCode} alt="QR Code Pix" className="w-64 h-64 object-contain" data-testid="img-qrcode"/>
        ) : (
          <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-400 gap-4">
            <p className="text-sm">Erro ao gerar QRCode</p>
          </div>
        )}
      </div>

      <div className="space-y-3 bg-slate-100 p-4 rounded-lg">
        <div>
          <p className="text-xs text-slate-600 uppercase font-bold mb-2">Código PIX para Cópia e Cola</p>
          <p className="text-xs text-slate-500 mb-3">Valor a pagar: <span className="font-bold text-slate-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((product?.price || 0) / (selectedPlan?.id || 1) / 100)}</span></p>
        </div>
        <div className="flex gap-2">
          <code className="flex-1 text-xs break-all text-slate-800 bg-white p-3 rounded border font-mono" data-testid="code-pix">
            {pixCode || "Gerando..."}
          </code>
          <Button 
            size="sm"
            variant="default"
            onClick={copyPixCode}
            disabled={isGenerating || !pixCode}
            data-testid="button-copy-pix"
            className="whitespace-nowrap"
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-orange-600 font-medium text-sm bg-orange-50 p-3 rounded">
        <Clock className="w-4 h-4" />
        Você tem {formatTime(timeLeft)} para pagar
      </div>

      <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 mb-2">Enviar Comprovante de Pagamento</h3>
          <p className="text-sm text-slate-600">Após realizar o pagamento via PIX, envie o comprovante para validar sua compra.</p>
        </div>
        
        {proofPreview ? (
          <div className="space-y-3">
            <div className="bg-white rounded-lg p-3 border border-slate-200">
              {proofFile?.type.startsWith('image/') ? (
                <img src={proofPreview} alt="Comprovante" className="w-full h-auto max-h-48 object-contain rounded" data-testid="img-proof" />
              ) : (
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium">{proofFile?.name}</p>
                    <p className="text-xs text-slate-500">{(proofFile?.size || 0 / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => {
                setProofFile(null);
                setProofPreview("");
              }}
              data-testid="button-remove-proof"
            >
              Remover Comprovante
            </Button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 cursor-pointer">
            <input 
              type="file" 
              accept="image/*,.pdf"
              onChange={handleProofUpload}
              className="hidden"
              data-testid="input-proof-file"
            />
            <div className="text-3xl">📤</div>
            <div className="text-center">
              <p className="font-medium text-slate-900">Clique para enviar</p>
              <p className="text-xs text-slate-500">Imagem ou PDF (máximo 5MB)</p>
            </div>
          </label>
        )}
      </div>

      {proofFile && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          <CheckCircle2 className="w-5 h-5 mx-auto mb-2 text-green-600" />
          Comprovante enviado! Você pode agora confirmar a compra.
        </div>
      )}

      <Button 
        className="w-full h-12 text-lg font-bold bg-green-600 hover:bg-green-700" 
        onClick={handlePayment}
        disabled={isCreatingOrder || !proofFile}
        data-testid="button-confirm-payment"
      >
        {isCreatingOrder ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
        {isCreatingOrder ? "Processando..." : "Confirmar e Continuar"}
      </Button>
    </motion.div>
  );
}

function Check({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="3" 
      strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
