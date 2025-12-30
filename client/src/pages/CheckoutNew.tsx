import { useParams, useLocation } from "wouter";
import { useState, useMemo } from "react";
import { useProduct } from "@/hooks/use-products";
import { useCreateOrder } from "@/hooks/use-orders";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, Upload, Check, Copy } from "lucide-react";
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

  const [step, setStep] = useState(1);
  const [installments, setInstallments] = useState(1);
  const [cepLoading, setCepLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    phone: "",
    whatsapp: "",
    email: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const [paymentProof, setPaymentProof] = useState(null as string | null);
  const [paidConfirmed, setPaidConfirmed] = useState(false);

  if (isLoadingProduct) {
    return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-6 h-6" /></div>;
  }
  if (!product) return <div className="text-center py-10">Produto não encontrado</div>;

  const finalPrice = Math.floor(product.price * 0.49);
  
  // Usar useMemo para garantir que os preços sejam recalculados quando installments ou cupom muda
  const { installmentValue, formattedTotal, formattedInstallment, totalWithDiscount } = useMemo(() => {
    const priceWithDiscount = Math.round(finalPrice * (1 - couponDiscount / 100));
    const instValue = Math.round(priceWithDiscount / installments);
    return {
      installmentValue: instValue,
      totalWithDiscount: priceWithDiscount,
      formattedTotal: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceWithDiscount / 100),
      formattedInstallment: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(instValue / 100),
    };
  }, [finalPrice, installments, couponDiscount]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast({ title: "Digite o código do cupom", variant: "destructive" });
      return;
    }

    setCouponLoading(true);
    try {
      const response = await fetch(`/api/coupons/${couponCode.toUpperCase()}`);
      if (!response.ok) {
        toast({ title: "Cupom inválido ou expirado", variant: "destructive" });
        setCouponDiscount(0);
        setCouponApplied(false);
        return;
      }
      
      const coupon = await response.json();
      setCouponDiscount(coupon.discountPercent);
      setCouponApplied(true);
      toast({ title: `Cupom aplicado! Desconto de ${coupon.discountPercent}%`, variant: "default" });
    } catch (error) {
      console.error('Coupon validation error:', error);
      toast({ title: "Erro ao validar cupom", variant: "destructive" });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCEPLookup = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setCepLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data: any = await response.json();
        console.log('CEP Response:', data);
        if (data && !data.erro && data.logradouro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || '',
          }));
          toast({ title: "Endereço encontrado!", variant: "default" });
        } else {
          toast({ title: "CEP não encontrado", variant: "destructive" });
        }
      } catch (error) {
        console.error('CEP lookup error:', error);
        toast({ title: "Erro ao buscar CEP", variant: "destructive" });
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handlePaymentProof = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPaymentProof(event.target?.result as string);
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
      totalAmount: totalWithDiscount,
      couponCode: couponApplied ? couponCode.toUpperCase() : undefined,
    };

    createOrder(orderData, {
      onSuccess: () => setStep(4),
      onError: (err) => toast({ title: "Erro no pedido", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 w-full px-3 py-4 sm:px-4 sm:py-6">
        <div className="mx-auto w-full max-w-sm">
          {/* Progress Steps */}
          <div className="mb-6 flex gap-1 sm:gap-2">
            {[
              { step: 1, label: "Parcela" },
              { step: 2, label: "Dados" },
              { step: 3, label: "Pagar" },
              { step: 4, label: "OK" },
            ].map((s) => (
              <div key={s.step} className="flex-1">
                <div className={`h-1.5 sm:h-2 rounded transition-all ${step >= s.step ? 'bg-blue-600' : 'bg-gray-300'}`} />
                <p className="text-xs mt-1 text-gray-600 text-center truncate">{s.label}</p>
              </div>
            ))}
          </div>

          <Card className="border border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b border-gray-200 p-3 sm:p-4">
              <CardTitle className="text-base sm:text-lg text-gray-900 truncate">{product.name}</CardTitle>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mt-2">{formattedTotal}</p>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">{installments}x {formattedInstallment}</p>
              {couponApplied && couponDiscount > 0 && (
                <p className="text-xs text-green-600 mt-2 font-semibold">Desconto: -{couponDiscount}%</p>
              )}
            </CardHeader>

            <CardContent className="p-4 sm:p-6 bg-white">
              {/* STEP 1: Installments */}
              {step === 1 && (
                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Escolha parcelamento</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map(x => (
                      <button
                        key={x}
                        onClick={() => setInstallments(x)}
                        className={`p-2 sm:p-3 rounded-md border-2 text-center transition-all text-xs sm:text-sm font-bold ${
                          installments === x
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                        }`}
                        data-testid={`installment-${x}`}
                      >
                        <div>{x}x</div>
                        <div className="text-xs mt-0.5 sm:mt-1">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.round(totalWithDiscount / x) / 100)}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-bold text-gray-900">Total: <span className="text-lg sm:text-xl text-blue-600">{formattedTotal}</span></p>
                    {couponApplied && couponDiscount > 0 && (
                      <p className="text-xs text-green-600 mt-1 font-semibold">Desconto aplicado: -{couponDiscount}%</p>
                    )}
                    <p className="text-xs text-gray-600 mt-2">Entrega todo Brasil • POA</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-gray-900 block">Cupom (opcional)</label>
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Ex: KEVIN5"
                        className="border-gray-300 text-sm h-9 sm:h-10 flex-1"
                        disabled={couponApplied}
                        data-testid="input-coupon"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || couponApplied}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold h-9 sm:h-10 text-sm px-3 sm:px-4"
                        data-testid="button-apply-coupon"
                      >
                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ativar'}
                      </Button>
                    </div>
                    {couponApplied && (
                      <button
                        onClick={() => {
                          setCouponCode("");
                          setCouponDiscount(0);
                          setCouponApplied(false);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                        data-testid="button-remove-coupon"
                      >
                        Remover cupom
                      </button>
                    )}
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 sm:h-12 text-sm sm:text-base" data-testid="button-continue-installment">
                    Continuar →
                  </Button>
                </div>
              )}

              {/* STEP 2: Personal Info */}
              {step === 2 && (
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Seus Dados</h2>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-gray-900 mb-1 block">Nome</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="João Silva"
                      className="border-gray-300 text-sm h-9 sm:h-10"
                      data-testid="input-name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <Label className="text-xs sm:text-sm font-bold text-gray-900 mb-1 block">CPF</Label>
                      <Input
                        value={formatCPF(formData.cpf)}
                        onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                        className="border-gray-300 text-sm h-9 sm:h-10"
                        data-testid="input-cpf"
                      />
                    </div>
                    <div>
                      <Label className="text-xs sm:text-sm font-bold text-gray-900 mb-1 block">Nascimento</Label>
                      <Input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        className="border-gray-300 text-sm h-9 sm:h-10"
                        data-testid="input-birthdate"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-gray-900 mb-1 block">Telefone</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(51) 9 9999-9999"
                      className="border-gray-300 text-sm h-9 sm:h-10"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-gray-900 mb-1 block">WhatsApp (opcional)</Label>
                    <Input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="(51) 9 9999-9999"
                      className="border-gray-300 text-sm h-9 sm:h-10"
                      data-testid="input-whatsapp"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-gray-900 mb-1 block">E-mail (opcional)</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                      className="border-gray-300 text-sm h-9 sm:h-10"
                      data-testid="input-email"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm font-bold text-gray-900 mb-1 block">CEP</Label>
                    <Input
                      value={formData.cep}
                      onChange={(e) => {
                        const v = e.target.value;
                        setFormData({ ...formData, cep: v });
                        if (v.length === 8) handleCEPLookup(v);
                      }}
                      placeholder="00000000"
                      maxLength="8"
                      className="border-gray-300 text-sm h-9 sm:h-10"
                      disabled={cepLoading}
                      data-testid="input-cep"
                    />
                  </div>

                  {formData.address && (
                    <>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <div className="col-span-2">
                          <Label className="text-xs font-bold text-gray-900 mb-1 block">Rua</Label>
                          <Input value={formData.address} disabled className="bg-gray-100 border-gray-300 text-gray-600 text-sm h-9 sm:h-10" />
                        </div>
                        <div>
                          <Label className="text-xs font-bold text-gray-900 mb-1 block">Nº</Label>
                          <Input
                            value={formData.number}
                            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                            placeholder="123"
                            className="border-gray-300 text-sm h-9 sm:h-10"
                            data-testid="input-number"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs font-bold text-gray-900 mb-1 block">Complemento</Label>
                        <Input
                          value={formData.complement}
                          onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                          placeholder="Apt 101"
                          className="border-gray-300 text-sm h-9 sm:h-10"
                          data-testid="input-complement"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        <Input value={formData.neighborhood} disabled className="bg-gray-100 border-gray-300 text-gray-600 text-sm h-9 sm:h-10" placeholder="Bairro" />
                        <Input value={formData.city} disabled className="bg-gray-100 border-gray-300 text-gray-600 text-sm h-9 sm:h-10" placeholder="Cidade" />
                        <Input value={formData.state} disabled className="bg-gray-100 border-gray-300 text-gray-600 text-sm h-9 sm:h-10" placeholder="UF" />
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setStep(1)} variant="outline" className="flex-1 border-gray-300 text-gray-900 h-10 sm:h-12 text-sm sm:text-base" data-testid="button-back-installment">
                      ← Voltar
                    </Button>
                    <Button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 sm:h-12 text-sm sm:text-base" data-testid="button-continue-data">
                      Continuar →
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: Payment Proof */}
              {step === 3 && (
                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">Comprovante</h2>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
                    <p className="text-gray-900 font-bold text-xs sm:text-sm">Dados para PIX:</p>
                    <p className="text-gray-700 mt-2 text-xs sm:text-sm"><strong>Recebedor:</strong> Adilson José Veiga</p>
                    <div className="flex items-center gap-2 mt-3 p-2 bg-white border border-gray-300 rounded">
                      <p className="text-gray-700 font-mono text-xs flex-1 break-all">33d03e5b-617b-491b-a60b-893a5dfb6934</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('33d03e5b-617b-491b-a60b-893a5dfb6934');
                          toast({ title: "PIX copiado!", variant: "default" });
                        }}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        data-testid="button-copy-pix"
                      >
                        <Copy className="w-4 h-4 text-blue-600" />
                      </button>
                    </div>
                    <p className="text-gray-600 text-xs mt-3"><strong>Valor:</strong> {formattedInstallment}</p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 sm:p-4 text-xs sm:text-sm">
                    <p className="text-gray-900"><strong>Importante:</strong> Após confirmar o primeiro pagamento, entraremos em contato para informar detalhes do seu pedido!</p>
                  </div>

                  <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-md p-4 sm:p-6 text-center cursor-pointer hover:border-blue-600 transition-colors" onClick={handlePaymentProof}>
                    {paymentProof ? (
                      <div>
                        <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="font-bold text-green-600 text-sm">Comprovante enviado!</p>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="font-bold text-gray-900 text-sm">Enviar comprovante</p>
                        <p className="text-xs text-gray-600 mt-1">PDF ou imagem do PIX</p>
                      </div>
                    )}
                  </div>

                  <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={paidConfirmed}
                      onChange={(e) => setPaidConfirmed(e.target.checked)}
                      className="mt-1"
                      data-testid="checkbox-paid"
                    />
                    <span className="text-xs sm:text-sm text-gray-900">
                      Confirmei pagamento de <strong>{formattedInstallment}</strong>
                    </span>
                  </label>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={() => setStep(2)} variant="outline" className="flex-1 border-gray-300 text-gray-900 h-10 sm:h-12 text-sm sm:text-base" data-testid="button-back-data">
                      ← Voltar
                    </Button>
                    <Button 
                      onClick={handleCreateOrder} 
                      disabled={isCreatingOrder || !paymentProof || !paidConfirmed}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-10 sm:h-12 text-sm sm:text-base disabled:opacity-50"
                      data-testid="button-finish"
                    >
                      {isCreatingOrder ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Finalizar →
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: Success */}
              {step === 4 && (
                <div className="text-center space-y-4 py-6">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-100">
                    <Check className="w-7 h-7 text-green-600" />
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-green-600">Compra Confirmada!</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {product.name} chegará em até <strong>2 horas</strong>
                  </p>
                  <div className="bg-gray-100 border border-gray-300 rounded-md p-3 sm:p-4 text-left">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 mb-2">Você receberá:</p>
                    <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                      <li>✓ Produto original com garantia</li>
                      <li>✓ Capinha grátis</li>
                      <li>✓ Carregador grátis</li>
                      <li>✓ Nota Fiscal</li>
                      <li>✓ Reembolso em 30 dias</li>
                    </ul>
                  </div>
                  <Button onClick={() => setLocation("/")} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 sm:h-12 text-sm sm:text-base mt-4" data-testid="button-home">
                    Voltar ao Início
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
